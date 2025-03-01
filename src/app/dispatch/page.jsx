'use client';

import { useState, useRef, useEffect } from 'react';
import { initSpeechRecognition, speakText, stopSpeaking } from '../../utils/speechUtils';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function DispatchCall() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [inputMode, setInputMode] = useState('unified'); // Changed to 'unified' from 'speech'
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [showWaveform, setShowWaveform] = useState(false);
  const [audioVisualization, setAudioVisualization] = useState([]);
  
  const recognitionRef = useRef(null);
  const conversationContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioInputRef = useRef(null);
  const textInputRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Initialize Gemini API
  const genAI = useRef(null);
  const model = useRef(null);
  
  useEffect(() => {
    // Initialize Gemini API if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey);
      model.current = genAI.current.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    }
  }, []);
  
  // Initialize speech recognition with faster response
  useEffect(() => {
    recognitionRef.current = initSpeechRecognition();
    
    if (recognitionRef.current) {
      // Set continuous to true for continuous recording
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update live transcript for display
        setLiveTranscript(interimTranscript);
        
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript.trim() + ' ');
          setLiveTranscript(''); // Clear interim transcript when final is available
          
          // Don't auto-stop recording to allow for continuous speech
          // We'll let the user manually stop when they're done
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Speech recognition error: ${event.error}`);
        stopRecording();
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.error('Error restarting recognition:', err);
          }
        }
      };
    } else {
      setError('Speech recognition is not supported in this browser.');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isListening]);
  
  // Scroll to bottom of conversation when it updates
  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);
  
  // Initialize audio recording with visualization
  const startAudioRecording = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Audio recording is not supported in this browser.');
      return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setIsRecordingAudio(true);
        setShowWaveform(true);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        // Set up audio visualization
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const audioContext = audioContextRef.current;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateVisualization = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Create a simplified array for visualization (just 10 values)
          const simplifiedArray = Array.from({length: 10}, (_, i) => {
            const start = Math.floor(i * bufferLength / 10);
            const end = Math.floor((i + 1) * bufferLength / 10);
            let sum = 0;
            for (let j = start; j < end; j++) {
              sum += dataArray[j];
            }
            return Math.floor(sum / (end - start));
          });
          
          setAudioVisualization(simplifiedArray);
          animationFrameRef.current = requestAnimationFrame(updateVisualization);
        };
        
        updateVisualization();
        
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/mp3' });
          setAudioBlob(blob);
          setAudioChunks(chunks);
          setIsRecordingAudio(false);
          setShowWaveform(false);
          
          // Create a file from the blob
          const file = new File([blob], "recording.mp3", { type: 'audio/mp3' });
          setAudioFile(file);
          
          // Release the microphone
          stream.getTracks().forEach(track => track.stop());
          
          // Stop visualization
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          
          // Process the audio file automatically
          uploadAudio(file, transcript);
        };
        
        mediaRecorder.start();
      })
      .catch(err => {
        console.error('Error accessing microphone:', err);
        setError('Error accessing microphone. Please check your permissions.');
      });
  };
  
  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else {
      setError('Please select a valid audio file.');
    }
  };
  
  const uploadAudio = async (fileToUpload = null, transcriptText = '') => {
    const fileToProcess = fileToUpload || audioFile;
    
    if (!fileToProcess) {
      setError('Please select or record an audio file first.');
      return;
    }
    
    if (!model.current) {
      setError('Gemini API is not initialized. Please check your API key.');
      return;
    }
    
    try {
      setIsUploading(true);
      setTranscription('Processing audio...');
      setError(''); // Clear any previous errors
      
      // Show processing message in conversation
      const processingMessage = { 
        role: 'system', 
        content: 'Processing audio...', 
        isProcessing: true 
      };
      setConversationHistory(prev => [...prev, processingMessage]);
      
      // Read the audio file as base64
      const reader = new FileReader();
      
      // Create a promise to handle the FileReader
      const audioDataPromise = new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64Data = reader.result.split(',')[1]; // Remove the data URL prefix
          resolve(base64Data);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read audio file'));
        };
      });
      
      // Read the file as data URL
      reader.readAsDataURL(fileToProcess);
      
      // Wait for the file to be read
      const base64Data = await audioDataPromise;
      
      // Format conversation history for context
      const formattedHistory = conversationHistory
        .filter(msg => !msg.isProcessing)
        .map(msg => `${msg.role === 'user' ? 'Caller' : 'Dispatch'}: ${msg.content}`)
        .join('\n');
      
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
The caller has sent an audio message. ${transcriptText ? `The transcript is: "${transcriptText}"` : ''}
Please respond as if you are speaking to the caller directly. Keep your response brief, focused, and helpful. Do not include any prefixes like "Dispatch:" in your response.`;
      
      // Create a part for the audio file
      const audioData = {
        inlineData: {
          data: base64Data,
          mimeType: fileToProcess.type || "audio/mp3"
        }
      };
      
      // Process with Gemini
      const result = await model.current.generateContent([
        systemPrompt,
        audioData
      ]);
      
      // Remove the processing message
      setConversationHistory(prev => prev.filter(msg => !msg.isProcessing));
      
      // Handle the response based on the Gemini API version
      let responseText;
      if (result && result.response) {
        if (typeof result.response.text === 'function') {
          responseText = result.response.text();
        } else if (result.response.text !== undefined) {
          responseText = result.response.text;
        } else if (result.response.candidates && result.response.candidates.length > 0) {
          responseText = result.response.candidates[0].content.parts[0].text;
        } else {
          responseText = "I'm sorry, I couldn't process your audio.";
          console.error("Unexpected response format:", result);
        }
      } else {
        responseText = "I'm sorry, I couldn't process your audio.";
        console.error("Invalid response:", result);
      }
      
      const audioTranscription = "[Audio processed directly by Gemini]";
      
      setTranscription(audioTranscription);
      
      // Add user message with transcription for audio
      const userMessage = { 
        role: 'user', 
        content: audioTranscription, 
        isAudio: true 
      };
      
      // Add AI response to conversation history
      const aiMessage = { role: 'assistant', content: responseText };
      setConversationHistory(prev => [...prev, userMessage, aiMessage]);
      
      setAiResponse(responseText);
      
      // Speak the response
      setIsSpeaking(true);
      speakText(responseText, 
        () => {
          setIsSpeaking(false);
          if (callStatus === 'connected') {
            // Reset for next input
            setAudioFile(null);
            if (audioInputRef.current) {
              audioInputRef.current.value = '';
            }
          }
        },
        () => {
          setIsSpeaking(true);
        }
      );
    } catch (err) {
      setError('Error processing your audio: ' + err.message);
      console.error('Error:', err);
      
      // Remove the processing message
      setConversationHistory(prev => prev.filter(msg => !msg.isProcessing));
    } finally {
      setIsUploading(false);
    }
  };
  
  const startRecording = () => {
    // In unified mode, we start both speech recognition and audio recording
    setIsRecording(true);
    setTranscript('');
    setError('');
    setIsListening(true);
    setShowWaveform(true);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
    
    // Also start audio recording for sending to Gemini
    startAudioRecording();
  };
  
  const stopRecording = async () => {
    setIsListening(false);
    setShowWaveform(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    
    setIsRecording(false);
    
    // Stop audio recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // We don't need to process transcript here as it will be handled by the audio recording stop event
  };
  
  const processTranscript = async () => {
    try {
      setIsProcessing(true);
      
      if (!model.current) {
        setError('Gemini API is not initialized. Please check your API key.');
        return;
      }
      
      // Format conversation history for context
      const formattedHistory = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'Caller' : 'Dispatch'}: ${msg.content}`)
        .join('\n');
      
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
Caller's latest message: ${transcript}

Respond as if you are speaking to the caller directly. Keep your response brief, focused, and helpful. Do not include any prefixes like "Dispatch:" in your response.`;

      // Process with Gemini
      const result = await model.current.generateContent(systemPrompt);
      
      // Handle the response based on the Gemini API version
      let responseText;
      if (result && result.response) {
        if (typeof result.response.text === 'function') {
          responseText = result.response.text();
        } else if (result.response.text !== undefined) {
          responseText = result.response.text;
        } else if (result.response.candidates && result.response.candidates.length > 0) {
          responseText = result.response.candidates[0].content.parts[0].text;
        } else {
          responseText = "I'm sorry, I couldn't process your request.";
          console.error("Unexpected response format:", result);
        }
      } else {
        responseText = "I'm sorry, I couldn't process your request.";
        console.error("Invalid response:", result);
      }
      
      // Add AI response to conversation history
      const aiMessage = { role: 'assistant', content: responseText };
      setConversationHistory(prev => [...prev, aiMessage]);
      
      setAiResponse(responseText);
      
      // Speak the response
      setIsSpeaking(true);
      speakText(responseText, 
        () => {
          setIsSpeaking(false);
          setTranscript('');
        },
        () => {
          setIsSpeaking(true);
        }
      );
    } catch (err) {
      setError('Error getting response from Gemini: ' + err.message);
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const initiateCall = () => {
    setCallStatus('calling');
    setConversationHistory([]);
    setAudioFile(null);
    
    // Simulate connecting to dispatch
    setTimeout(() => {
      setCallStatus('connected');
      
      // Add initial greeting to conversation
      const initialGreeting = "911 Emergency Dispatch. What's your emergency?";
      setConversationHistory([{ role: 'assistant', content: initialGreeting }]);
      
      // Speak the greeting and start recording when done
      speakText(initialGreeting, () => {
        if (inputMode === 'unified') {
          startRecording();
        }
      }, () => {
        setIsSpeaking(true);
      });
    }, 2000);
  };
  
  const endCall = () => {
    if (inputMode === 'unified') {
      stopRecording();
    } else if (isRecordingAudio) {
      stopAudioRecording();
    }
    setCallStatus('ended');
    stopSpeaking();
  };
  
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    
    if (!textInput.trim()) return;
    
    try {
      setIsProcessingText(true);
      setError('');
      
      // Add user message to conversation history
      const userMessage = { role: 'user', content: textInput };
      setConversationHistory(prev => [...prev, userMessage]);
      
      if (!model.current) {
        setError('Gemini API is not initialized. Please check your API key.');
        return;
      }
      
      // Format conversation history for context
      const formattedHistory = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'Caller' : 'Dispatch'}: ${msg.content}`)
        .join('\n');
      
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
Caller's latest message: ${textInput}

Respond as if you are speaking to the caller directly. Keep your response brief, focused, and helpful. Do not include any prefixes like "Dispatch:" in your response.`;

      // Process with Gemini
      const result = await model.current.generateContent(systemPrompt);
      
      // Handle the response based on the Gemini API version
      let responseText;
      if (result && result.response) {
        if (typeof result.response.text === 'function') {
          responseText = result.response.text();
        } else if (result.response.text !== undefined) {
          responseText = result.response.text;
        } else if (result.response.candidates && result.response.candidates.length > 0) {
          responseText = result.response.candidates[0].content.parts[0].text;
        } else {
          responseText = "I'm sorry, I couldn't process your request.";
          console.error("Unexpected response format:", result);
        }
      } else {
        responseText = "I'm sorry, I couldn't process your request.";
        console.error("Invalid response:", result);
      }
      
      // Add AI response to conversation history
      const aiMessage = { role: 'assistant', content: responseText };
      setConversationHistory(prev => [...prev, aiMessage]);
      
      setAiResponse(responseText);
      
      // Speak the response
      setIsSpeaking(true);
      speakText(responseText, 
        () => {
          setIsSpeaking(false);
        },
        () => {
          setIsSpeaking(true);
        }
      );
      
      // Clear text input
      setTextInput('');
      
    } catch (err) {
      setError('Error getting response from Gemini: ' + err.message);
      console.error('Error:', err);
    } finally {
      setIsProcessingText(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Emergency Dispatch AI</h1>
      
      <div className="flex-1 flex flex-col">
        {/* Phone UI */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col flex-1 border border-gray-200">
          {/* Call status bar */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <div className="text-sm font-medium">
              {callStatus === 'idle' && 'Ready to call'}
              {callStatus === 'calling' && 'Calling dispatch...'}
              {callStatus === 'connected' && 'Connected to AI Dispatch'}
              {callStatus === 'ended' && 'Call ended'}
            </div>
            <div className="flex items-center gap-2">
              {callStatus === 'connected' && (
                <button 
                  onClick={() => setInputMode(inputMode === 'unified' ? 'text' : 'unified')}
                  className="text-xs px-2 py-1 bg-blue-700 rounded-full hover:bg-blue-800"
                >
                  {inputMode === 'unified' ? 'Switch to Text' : 'Switch to Voice'}
                </button>
              )}
              <div className="text-sm font-medium">
                {isRecording && 'Recording...'}
                {isProcessing && 'Processing...'}
                {isUploading && 'Uploading...'}
                {isRecordingAudio && 'Recording Audio...'}
              </div>
            </div>
          </div>
          
          {/* Conversation area */}
          <div 
            ref={conversationContainerRef}
            className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3"
          >
            {conversationHistory.length > 0 ? (
              conversationHistory.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg max-w-[85%] ${
                    message.role === 'user' 
                      ? 'bg-blue-100 ml-auto text-blue-900' 
                      : message.role === 'system'
                        ? 'bg-yellow-100 mx-auto text-yellow-900 text-center'
                        : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">{typeof message.content === 'function' ? 'Processing...' : message.content}</p>
                    </div>
                  ) : message.isAudio ? (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                      </svg>
                      <p className="text-sm font-medium">{typeof message.content === 'function' ? 'Message content unavailable' : message.content}</p>
                    </div>
                  ) : (
                    <p className="text-sm">{typeof message.content === 'function' ? 'Message content unavailable' : message.content}</p>
                  )}
                </div>
              ))
            ) : (
              <>
                {callStatus === 'idle' && (
                  <div className="text-center p-4">
                    <p className="text-gray-500">Press the call button to connect to AI dispatch</p>
                  </div>
                )}
                
                {callStatus === 'calling' && (
                  <div className="text-center p-4">
                    <p className="text-gray-500">Connecting to AI dispatch...</p>
                  </div>
                )}
              </>
            )}
            
            {/* Enhanced recording visualization */}
            {showWaveform && (
              <div className="bg-blue-50 p-3 rounded-lg max-w-[85%] ml-auto border border-blue-100 text-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-medium text-blue-500">Recording...</p>
                </div>
                
                {/* Audio waveform visualization */}
                <div className="flex items-center justify-center h-12 mb-2">
                  {audioVisualization.length > 0 ? (
                    <div className="flex items-center justify-center gap-1 h-full w-full">
                      {audioVisualization.map((value, i) => (
                        <div 
                          key={i}
                          className="bg-blue-500 rounded-full w-1"
                          style={{ 
                            height: `${Math.max(15, value / 2)}%`,
                            animation: 'pulse 1s infinite',
                            animationDelay: `${i * 0.1}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 h-full w-full">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i}
                          className="bg-blue-500 rounded-full w-1"
                          style={{ 
                            height: `${20 + Math.random() * 60}%`,
                            animation: 'pulse 1s infinite',
                            animationDelay: `${i * 0.1}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Live transcript */}
                <div className="text-sm font-medium">
                  {transcript && <p className="mb-1">{transcript}</p>}
                  {liveTranscript && (
                    <p className="text-blue-400 italic">{liveTranscript}</p>
                  )}
                  {!transcript && !liveTranscript && (
                    <p className="text-blue-400 italic">Speak now...</p>
                  )}
                </div>
              </div>
            )}
            
            {isSpeaking && (
              <div className="p-3 rounded-lg bg-gray-700 mr-auto max-w-[80%] text-white">
                <div className="flex items-center">
                  <div className="mr-2">Dispatch speaking</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm border border-red-100">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <p>{typeof error === 'function' ? 'Error occurred' : error}</p>
                </div>
              </div>
            )}
            
            {callStatus === 'ended' && conversationHistory.length === 0 && (
              <div className="text-center p-4">
                <p className="text-gray-500">Call has ended</p>
              </div>
            )}
          </div>
          
          {/* Input area for text mode */}
          {inputMode === 'text' && callStatus === 'connected' && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessingText}
                  ref={textInputRef}
                />
                <button
                  type="submit"
                  disabled={isProcessingText || !textInput.trim()}
                  className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingText ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                      <span>Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
          
          {/* Call controls */}
          <div className="bg-gray-100 p-4 flex justify-center items-center gap-6 border-t border-gray-200">
            {callStatus === 'idle' && (
              <button
                onClick={initiateCall}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </button>
            )}
            
            {(callStatus === 'connected' || callStatus === 'calling') && (
              <>
                <button
                  onClick={endCall}
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {inputMode === 'unified' && !isRecording && !isProcessing && callStatus === 'connected' && (
                  <button
                    onClick={startRecording}
                    className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 shadow-md relative overflow-hidden group"
                  >
                    {/* Pulsing circle animation */}
                    <div className="absolute inset-0 bg-blue-400 opacity-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-700"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 relative z-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  </button>
                )}
                
                {inputMode === 'unified' && isRecording && (
                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white hover:bg-yellow-600 shadow-md relative overflow-hidden"
                  >
                    {/* Recording animation */}
                    <div className="absolute inset-0 bg-yellow-400 opacity-30 rounded-full animate-ping"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 relative z-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                    </svg>
                  </button>
                )}
              </>
            )}
            
            {callStatus === 'ended' && (
              <button
                onClick={() => setCallStatus('idle')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
              >
                New Call
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scaleY(0.7); }
          50% { transform: scaleY(1); }
          100% { transform: scaleY(0.7); }
        }
      `}</style>
    </div>
  );
} 