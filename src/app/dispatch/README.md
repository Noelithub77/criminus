# AI Dispatch Call System

## Overview
The AI Dispatch Call System is a web-based application that simulates an emergency dispatch call experience using AI. It provides a minimalistic phone call interface where users can interact with an AI dispatch assistant through voice or direct audio upload.

## Features
- **Minimalistic Phone Call Interface**: Clean, intuitive UI that simulates a phone call experience
- **Two Input Modes**:
  - **Voice Input**: Real-time speech recognition with live transcription display
  - **Direct Audio Upload**: Record or upload audio files for processing
- **AI-Powered Responses**: Contextual responses from an AI dispatch assistant
- **Text-to-Speech Output**: AI responses are spoken aloud for a realistic experience
- **Visual Indicators**: Shows when the system is listening, processing, or speaking
- **Conversation History**: Maintains a record of the entire conversation

## How It Works

### Voice Input Mode
1. User initiates a call to the dispatch system
2. User speaks into their microphone
3. Speech is transcribed in real-time and displayed on screen
4. Transcribed text is sent to the AI model
5. AI generates a contextual response
6. Response is displayed and spoken back to the user

### Direct Audio Upload Mode
1. User can record audio directly in the browser or upload an audio file
2. Audio file is sent to the server and converted to base64 format
3. Base64-encoded audio is sent to Gemini AI for processing
4. Gemini processes the audio content directly using its multimodal capabilities
5. AI generates a contextual response based on the audio content
6. Response is displayed and spoken back to the user

## Technical Implementation

### Key Components
- **page.jsx**: Main UI component for the dispatch call system
- **api/dispatch/route.js**: API route for handling text-based interactions
- **api/dispatch/audio/route.js**: API route for handling audio file uploads
- **utils/speechUtils.js**: Utility functions for speech recognition and synthesis

### APIs Used
- **Web Speech API**: For browser-based speech recognition and synthesis
- **Gemini AI**: For generating contextual responses to user inputs
- **Gemini Multimodal Capabilities**: For direct audio processing using base64-encoded audio data

### System Instructions
The AI is instructed to act as an emergency dispatch assistant, focusing on:
1. Remaining calm and professional
2. Gathering essential information about emergencies
3. Providing clear instructions
4. Reassuring callers
5. Keeping responses concise and focused
6. Asking for location, nature of emergency, and immediate dangers
7. Providing first aid instructions when needed

## Limitations
- Relies on browser support for the Web Speech API
- Audio quality may affect speech recognition accuracy
- Direct audio processing with Gemini may have latency depending on file size
- Simulates a dispatch call experience but is not connected to real emergency services

## Future Improvements
- Integration with real emergency services
- Enhanced voice recognition for noisy environments
- Support for multiple languages
- Ability to handle multiple callers simultaneously
- Improved audio processing with reduced latency
- Integration with location services for automatic caller location 