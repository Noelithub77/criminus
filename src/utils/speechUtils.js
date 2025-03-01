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
 * @returns {boolean} True if speech synthesis is supported, false otherwise
 */
export function speakText(text, onEnd = () => {}, onStart = () => {}) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Get available voices and set a more natural one if available
    let voices = window.speechSynthesis.getVoices();
    
    // If voices array is empty, wait for voices to load
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setPreferredVoice(utterance, voices);
        window.speechSynthesis.speak(utterance);
        onStart();
      };
    } else {
      setPreferredVoice(utterance, voices);
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
 * Sets the preferred voice for speech synthesis
 * @param {SpeechSynthesisUtterance} utterance - The utterance to set the voice for
 * @param {Array} voices - Available voices
 */
function setPreferredVoice(utterance, voices) {
  // Try to find a good voice in this order of preference
  const preferredVoice = voices.find(voice => 
    voice.name.includes('Google US English Female') ||
    voice.name.includes('Microsoft Zira') ||
    voice.name.includes('Female') ||
    voice.name.includes('Google') ||
    voice.name.includes('Natural')
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