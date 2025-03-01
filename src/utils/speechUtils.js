/**
 * Initializes speech recognition
 * @returns {SpeechRecognition|null} Speech recognition object or null if not supported
 */
export function initSpeechRecognition() {
  if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    return recognition;
  }
  return null;
}

/**
 * Speaks text using the Web Speech API
 * @param {string} text - Text to speak
 * @param {Function} onEnd - Callback function to execute when speech ends
 * @param {Function} onStart - Callback function to execute when speech starts
 * @param {Object} voiceParams - Parameters for the speech synthesis
 * @param {number} voiceParams.rate - Speech rate (0.1 to 10)
 * @param {number} voiceParams.pitch - Speech pitch (0 to 2)
 * @param {number} voiceParams.volume - Speech volume (0 to 1)
 * @param {string} voiceParams.voiceURI - Voice URI to use
 * @returns {boolean} True if speech synthesis is supported, false otherwise
 */
export function speakText(text, onEnd = () => {}, onStart = () => {}, voiceParams = {}) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Handle case where text might be a function
    const textToSpeak = typeof text === 'function' ? 'Sorry, there was an error processing the response.' : text;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set voice parameters with defaults and bounds
    utterance.rate = Math.min(Math.max(voiceParams.rate || 1.0, 0.1), 10);
    utterance.pitch = Math.min(Math.max(voiceParams.pitch || 1.0, 0), 2);
    utterance.volume = Math.min(Math.max(voiceParams.volume || 1.0, 0), 1);
    
    // Get available voices and set a more natural one if available
    let voices = window.speechSynthesis.getVoices();
    
    // If voices array is empty, wait for voices to load
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setPreferredVoice(utterance, voices, voiceParams.voiceURI);
        window.speechSynthesis.speak(utterance);
        onStart();
      };
    } else {
      setPreferredVoice(utterance, voices, voiceParams.voiceURI);
      window.speechSynthesis.speak(utterance);
      onStart();
    }
    
    utterance.onend = onEnd;
    return true;
  }
  
  // Speech synthesis not supported
  onEnd();
  return false;
}

/**
 * Gets all available speech synthesis voices
 * @returns {Array} Array of available voices
 */
export function getAvailableVoices() {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
}

/**
 * Sets the preferred voice for speech synthesis
 * @param {SpeechSynthesisUtterance} utterance - The utterance to set the voice for
 * @param {Array} voices - Available voices
 * @param {string} voiceURI - Optional voice URI to use
 */
function setPreferredVoice(utterance, voices, voiceURI = null) {
  // If a specific voice URI is provided, try to use it
  if (voiceURI) {
    const requestedVoice = voices.find(voice => voice.voiceURI === voiceURI);
    if (requestedVoice) {
      utterance.voice = requestedVoice;
      return;
    }
  }
  
  // Try to find a good voice in this order of preference
  const preferredVoice = voices.find(voice => 
    voice.name.includes('Google US English Female') ||
    voice.name.includes('Microsoft Zira') ||
    voice.name.includes('Natural') ||
    voice.name.includes('Female') ||
    voice.name.includes('Google')
  );
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
}

/**
 * Stops any ongoing speech synthesis
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks if speech synthesis is currently speaking
 * @returns {boolean} True if speaking, false otherwise
 */
export function isSpeaking() {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
} 