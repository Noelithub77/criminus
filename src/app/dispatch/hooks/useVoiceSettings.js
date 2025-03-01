'use client';

import { useState, useEffect } from 'react';
import { getAvailableVoices, speakText } from '../../../utils/speechUtils';

/**
 * Custom hook for voice settings functionality
 * @returns {Object} Voice settings state and controls
 */
export function useVoiceSettings() {
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceParams, setVoiceParams] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voiceURI: ''
  });
  const [availableVoices, setAvailableVoices] = useState([]);
  
  // Load available voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Get initial voices
      const voices = getAvailableVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Set default voice if available
        const defaultVoice = voices.find(voice => 
          voice.name.includes('Google US English Female') ||
          voice.name.includes('Microsoft Zira') ||
          voice.name.includes('Natural') ||
          voice.name.includes('Female') ||
          voice.name.includes('Google')
        );
        if (defaultVoice) {
          setVoiceParams(prev => ({ ...prev, voiceURI: defaultVoice.voiceURI }));
        }
      }
      
      // Listen for voices changed event
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = getAvailableVoices();
        setAvailableVoices(updatedVoices);
        
        // Set default voice if not already set
        if (!voiceParams.voiceURI && updatedVoices.length > 0) {
          const defaultVoice = updatedVoices.find(voice => 
            voice.name.includes('Google US English Female') ||
            voice.name.includes('Microsoft Zira') ||
            voice.name.includes('Natural') ||
            voice.name.includes('Female') ||
            voice.name.includes('Google')
          );
          if (defaultVoice) {
            setVoiceParams(prev => ({ ...prev, voiceURI: defaultVoice.voiceURI }));
          }
        }
      };
    }
  }, []);
  
  const handleVoiceParamChange = (param, value) => {
    setVoiceParams(prev => ({ ...prev, [param]: value }));
  };
  
  const toggleVoiceSettings = () => {
    setShowVoiceSettings(!showVoiceSettings);
  };
  
  const testVoice = () => {
    speakText("This is a test of the emergency dispatch voice.", () => {}, () => {}, voiceParams);
  };
  
  return {
    showVoiceSettings,
    voiceParams,
    availableVoices,
    handleVoiceParamChange,
    toggleVoiceSettings,
    testVoice
  };
} 