'use client';

import { useState, useRef, useEffect } from 'react';
import { initSpeechRecognition, speakText, stopSpeaking } from '../../utils/speechUtils';

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
  const [inputMode, setInputMode] = useState('speech'); // 'speech' or 'file'
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const recognitionRef = useRef(null);
  const conversationContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioInputRef = useRef(null);
  
  // Initialize speech recognition
  useEffect(() => {
    recognitionRef.current = initSpeechRecognition();
    
    if (recognitionRef.current) {
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
          setTranscript(prevTranscript => prevTranscript + finalTranscript);
          setLiveTranscript(''); // Clear interim transcript when final is available
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Speech recognition error: ${event.error}`);
        stopRecording();
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
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
  
  // Initialize audio recording
  const startAudioRecording = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Audio recording is not supported in this browser.');
      return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setIsRecordingAudio(true);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
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
          
          // Create a file from the blob
          const file = new File([blob], "recording.mp3", { type: 'audio/mp3' });
          setAudioFile(file);
          
          // Release the microphone
          stream.getTracks().forEach(track => track.stop());
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
  
  const uploadAudio = async () => {
    if (!audioFile) {
      setError('Please select or record an audio file first.');
      return;
    }
    
    try {
      setIsUploading(true);
      setTranscription('Processing audio...');
      setError(''); // Clear any previous errors
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      // Add conversation history to the form data
      formData.append('conversationHistory', JSON.stringify(conversationHistory));
      
      // Show processing message in conversation
      const processingMessage = { 
        role: 'system', 
        content: 'Processing audio...', 
        isProcessing: true 
      };
      setConversationHistory(prev => [...prev, processingMessage]);
      
      const response = await fetch('/api/dispatch/audio', {
        method: 'POST',
        body: formData,
      });
      
      // Remove the processing message
      setConversationHistory(prev => prev.filter(msg => !msg.isProcessing));
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process audio file');
      }
      
      const data = await response.json();
      const responseText = data.response;
      const audioTranscription = data.transcription || '[Audio processed directly by Gemini]';
      
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
    } finally {
      setIsUploading(false);
    }
  };
  
  const startRecording = () => {
    setIsRecording(true);
    setTranscript('');
    setError('');
    setIsListening(true);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };
  
  const stopRecording = async () => {
    setIsListening(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    
    setIsRecording(false);
    
    if (transcript.trim()) {
      // Add user message to conversation history
      const userMessage = { role: 'user', content: transcript };
      setConversationHistory(prev => [...prev, userMessage]);
      
      await processTranscript();
    }
  };
  
  const processTranscript = async () => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          conversationHistory,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from dispatch API');
      }
      
      const data = await response.json();
      const responseText = data.response;
      
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
      setError('Error getting response from dispatch. Please try again.');
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
        if (inputMode === 'speech') {
          startRecording();
        }
      });
    }, 2000);
  };
  
  const endCall = () => {
    if (inputMode === 'speech') {
      stopRecording();
    } else if (isRecordingAudio) {
      stopAudioRecording();
    }
    setCallStatus('ended');
    stopSpeaking();
  };
  
  const toggleInputMode = () => {
    // Stop current input method
    if (inputMode === 'speech' && isRecording) {
      stopRecording();
    } else if (inputMode === 'file' && isRecordingAudio) {
      stopAudioRecording();
    }
    
    // Toggle mode
    setInputMode(prev => prev === 'speech' ? 'file' : 'speech');
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
                  onClick={toggleInputMode}
                  className="text-xs px-2 py-1 bg-blue-700 rounded-full hover:bg-blue-800"
                >
                  {inputMode === 'speech' ? 'Switch to Audio Upload' : 'Switch to Speech'}
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
                      <p className="text-sm font-medium">{message.content}</p>
                    </div>
                  ) : message.isAudio ? (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                      </svg>
                      <p className="text-sm font-medium">{message.content}</p>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
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
            
            {isRecording && liveTranscript && (
              <div className="bg-blue-50 p-3 rounded-lg max-w-[85%] ml-auto border border-blue-100 text-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-medium text-blue-500">Listening...</p>
                </div>
                <p className="text-sm">{liveTranscript}</p>
              </div>
            )}
            
            {isSpeaking && (
              <div className="p-3 rounded-lg bg-gray-700 mr-auto max-w-[80%] opacity-70">
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
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {callStatus === 'ended' && conversationHistory.length === 0 && (
              <div className="text-center p-4">
                <p className="text-gray-500">Call has ended</p>
              </div>
            )}
          </div>
          
          {/* Input area for audio file mode */}
          {inputMode === 'file' && callStatus === 'connected' && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                {!audioFile ? (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={startAudioRecording}
                        disabled={isRecordingAudio || isUploading}
                        className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                        </svg>
                        Record Audio
                      </button>
                      <label className="flex-1 py-2 px-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload Audio
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleFileChange}
                          className="hidden"
                          ref={audioInputRef}
                        />
                      </label>
                    </div>
                    {isRecordingAudio && (
                      <div className="flex justify-center">
                        <button
                          onClick={stopAudioRecording}
                          className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
                        >
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                          Stop Recording
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-blue-50 p-2 rounded-md border border-blue-100">
                      <div className="flex items-center gap-2 text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {audioFile.name || "Recording.mp3"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setAudioFile(null);
                          if (audioInputRef.current) {
                            audioInputRef.current.value = '';
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={uploadAudio}
                      disabled={isUploading}
                      className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                          </svg>
                          Send Audio
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
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
                
                {inputMode === 'speech' && !isRecording && !isProcessing && callStatus === 'connected' && (
                  <button
                    onClick={startRecording}
                    className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  </button>
                )}
                
                {inputMode === 'speech' && isRecording && (
                  <button
                    onClick={stopRecording}
                    className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white hover:bg-yellow-600 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
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
    </div>
  );
} 