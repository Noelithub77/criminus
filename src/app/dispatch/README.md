# AI Dispatch Call System

This is a proof-of-concept implementation of an AI-powered emergency dispatch call system using Next.js, Langchain, and the Gemini API.

## Features

- Minimalistic phone call interface with improved UI and visibility
- Two input modes:
  - Voice input using Web Speech API with real-time transcription display
  - Direct audio upload to Gemini (record or upload audio files)
- AI-powered responses using Gemini API via Langchain
- Text-to-speech output for AI responses
- Conversation history tracking
- Simulated emergency dispatch experience

## How It Works

### Speech Recognition Mode

1. The user initiates a call to the AI dispatch system
2. The system greets the user with a standard dispatch greeting
3. The user speaks into their microphone to describe their emergency
4. The speech is converted to text using the Web Speech API (with real-time display)
5. The text is sent to the Gemini API via Langchain with appropriate system instructions
6. The AI generates a response based on the emergency context
7. The response is converted back to speech using the Web Speech API
8. The conversation continues until the call is ended

### Direct Audio Upload Mode

1. The user initiates a call and switches to audio upload mode
2. The user can either record audio directly or upload an audio file
3. The audio file is sent to the server
4. The server processes the audio file and sends it to Gemini API
5. Gemini processes the audio content and generates a response
6. The response is sent back to the client and spoken using text-to-speech
7. The conversation continues until the call is ended

## Technical Implementation

### Components

- `page.jsx`: Main UI component for the dispatch call interface
- `api/dispatch/route.js`: API route for handling text-based Gemini API calls
- `api/dispatch/audio/route.js`: API route for handling audio file uploads to Gemini
- `utils/speechUtils.js`: Utility functions for speech recognition and text-to-speech

### APIs Used

- Web Speech API for speech recognition and text-to-speech
- Gemini API via Langchain for AI responses
- File System API for handling audio file uploads

### System Instructions

The AI is instructed to act as an emergency dispatch assistant with the following guidelines:

1. Remain calm and professional at all times
2. Gather essential information about the emergency
3. Provide clear instructions to the caller
4. Reassure the caller that help is on the way
5. Keep responses concise and focused on the emergency at hand
6. Ask for location, nature of emergency, and any immediate dangers
7. Provide first aid instructions if needed

## Limitations

- Relies on browser support for Web Speech API and MediaRecorder API
- Voice recognition quality depends on microphone and environment
- AI responses are limited by the capabilities of the Gemini model
- No actual emergency services are contacted (proof-of-concept only)
- Direct audio upload to Gemini is simulated (Gemini doesn't directly process audio files yet)

## Future Improvements

- Integration with real emergency services
- Enhanced voice recognition for noisy environments
- Support for multiple languages
- Location tracking for emergency response
- Call recording and transcription for documentation
- Fallback mechanisms for when AI fails to understand the emergency
- Integration with Gemini's native audio processing capabilities when available 