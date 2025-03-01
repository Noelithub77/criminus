import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    // Get conversation history if available
    let conversationHistory = [];
    const conversationHistoryStr = formData.get('conversationHistory');
    if (conversationHistoryStr) {
      try {
        conversationHistory = JSON.parse(conversationHistoryStr);
      } catch (err) {
        console.error('Error parsing conversation history:', err);
      }
    }
    
    // Save the file temporarily
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique filename
    const filename = `${uuidv4()}-${audioFile.name}`;
    const filepath = join(uploadsDir, filename);
    
    // Write the file
    await writeFile(filepath, buffer);
    
    // Format conversation history for context
    const formattedHistory = conversationHistory.map(msg => 
      `${msg.role === 'user' ? 'Caller' : 'Dispatch'}: ${msg.content}`
    ).join('\n');
    
    // Read the file as binary data
    const fileData = await readFile(filepath);
    
    // Create system prompt
    const systemPrompt = `You are an emergency dispatch AI assistant. Your job is to:
1. Remain calm and professional at all times
2. Gather essential information about the emergency
3. Provide clear instructions to the caller
4. Reassure the caller that help is on the way
5. Keep responses concise and focused on the emergency at hand
6. Ask for location, nature of emergency, and any immediate dangers
7. Provide first aid instructions if needed

${formattedHistory ? `Previous conversation:\n${formattedHistory}\n\n` : ''}
The caller has sent an audio message. Please respond as if you are speaking to the caller directly. Keep your response brief, focused, and helpful. Do not include any prefixes like "Dispatch:" in your response.`;
    
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create a part for the audio file
    const audioData = {
      inlineData: {
        data: Buffer.from(fileData).toString('base64'),
        mimeType: audioFile.type || "audio/mp3"
      }
    };
    
    // Process with Gemini
    const result = await model.generateContent([
      systemPrompt,
      audioData
    ]);
    
    const responseText = result.response.text;
    
    // Return the response
    return NextResponse.json({ 
      response: responseText,
      transcription: "Audio processed directly by Gemini" // We don't get a separate transcription
    });
    
  } catch (error) {
    console.error('Error processing audio file:', error);
    return NextResponse.json(
      { error: 'Failed to process audio file: ' + error.message },
      { status: 500 }
    );
  }
} 