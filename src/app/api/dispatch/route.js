import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { transcript, conversationHistory = [] } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-2.0-flash-lite",
      maxOutputTokens: 2048,
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    });

    // Format conversation history for context
    const formattedHistory = conversationHistory.map(msg => 
      `${msg.role === 'user' ? 'Caller' : 'Dispatch'}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `You are an emergency dispatch AI assistant. Your job is to:
1. Remain calm and professional at all times
2. Gather essential information about the emergency
3. Provide clear instructions to the caller
4. Reassure the caller that help is on the way
5. Keep responses concise and focused on the emergency at hand
6. Ask for location, nature of emergency, and any immediate dangers
7. Provide first aid instructions if needed

${formattedHistory ? `Previous conversation:\n${formattedHistory}\n\n` : ''}
Caller's latest message: ${transcript}

Respond as if you are speaking to the caller directly. Keep your response brief, focused, and helpful. Do not include any prefixes like "Dispatch:" in your response.`;

    const response = await model.invoke(systemPrompt);
    const responseText = response.content;

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Error processing dispatch request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 