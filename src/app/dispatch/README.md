# AI Dispatch Call System

## Overview
The AI Dispatch Call System is a web-based application that simulates an emergency dispatch call experience using AI. It provides a minimalistic phone call interface where users can interact with an AI dispatch assistant through multiple input methods.

## Features
- **Minimalistic Phone Call Interface**: Clean, intuitive UI that simulates a phone call experience
- **Three Input Modes**:
  - **Voice Input**: Real-time speech recognition with live transcription display and optimized for faster response
  - **Text Input**: Direct text chat with the AI assistant
  - **Direct Audio Upload**: Record or upload audio files for processing
- **AI-Powered Responses**: Contextual responses from an AI dispatch assistant
- **Text-to-Speech Output**: AI responses are spoken aloud for a realistic experience
- **Visual Indicators**: Shows when the system is listening, processing, or speaking
- **Conversation History**: Maintains a record of the entire conversation
- **Fully Client-Side Processing**: All interactions (text, voice, and audio) are processed directly in the browser

## How It Works

### Voice Input Mode
1. User initiates a call to the dispatch system
2. User speaks into their microphone
3. Speech is transcribed in real-time and displayed on screen
4. When the user pauses, the system automatically processes the input for faster response
5. Transcribed text is processed directly by the Gemini AI model in the browser
6. AI generates a contextual response
7. Response is displayed and spoken back to the user

### Text Input Mode
1. User types their message in the text input field
2. Message is sent to the Gemini AI model directly in the browser
3. AI generates a contextual response
4. Response is displayed and spoken back to the user

### Direct Audio Upload Mode
1. User can record audio directly in the browser or upload an audio file
2. Audio file is converted to base64 format directly in the browser
3. Base64-encoded audio is sent to Gemini AI for processing
4. Gemini processes the audio content directly using its multimodal capabilities
5. AI generates a contextual response based on the audio content
6. Response is displayed and spoken back to the user

## Technical Implementation

### Key Components
- **page.jsx**: Main UI component for the dispatch call system with integrated Gemini API processing for all input types
- **utils/speechUtils.js**: Utility functions for speech recognition and synthesis

### APIs Used
- **Web Speech API**: For browser-based speech recognition and synthesis
- **Gemini AI**: For generating contextual responses to user inputs (text and audio)
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

## Optimizations
- **Faster Voice Processing**: Speech recognition is configured for quicker response by automatically processing speech when the user pauses
- **Hybrid Input System**: Users can seamlessly switch between voice, text, and audio upload based on their preference or needs
- **Efficient API Usage**: All processing happens directly in the browser, minimizing latency

## Limitations
- Relies on browser support for the Web Speech API
- Audio quality may affect speech recognition accuracy
- Direct audio processing with Gemini may have latency depending on file size
- Simulates a dispatch call experience but is not connected to real emergency services
- Requires the Gemini API key to be exposed as a client-side environment variable
- Large conversations or audio files may be limited by browser memory constraints

## Future Improvements
- Integration with real emergency services
- Enhanced voice recognition for noisy environments
- Support for multiple languages
- Ability to handle multiple callers simultaneously
- Improved audio processing with reduced latency
- Integration with location services for automatic caller location
- Optional server-side processing for larger files or enhanced security 