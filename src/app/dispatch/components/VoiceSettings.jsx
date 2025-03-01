'use client';

/**
 * Voice settings panel component
 */
export default function VoiceSettings({ 
  showVoiceSettings, 
  voiceParams, 
  availableVoices, 
  handleVoiceParamChange, 
  toggleVoiceSettings,
  testVoice
}) {
  if (!showVoiceSettings) return null;
  
  return (
    <div className="bg-gray-50 p-3 border-b border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Voice Settings</h3>
        <button 
          onClick={toggleVoiceSettings}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close voice settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Voice Selection */}
        <div>
          <label htmlFor="voice-select" className="block text-xs font-medium text-gray-700 mb-1">Voice</label>
          <select
            id="voice-select"
            value={voiceParams.voiceURI}
            onChange={(e) => handleVoiceParamChange('voiceURI', e.target.value)}
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {availableVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
        
        {/* Rate Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="rate-slider" className="block text-xs font-medium text-gray-700">Speed: {voiceParams.rate.toFixed(1)}x</label>
            <button 
              onClick={() => handleVoiceParamChange('rate', 1.0)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          </div>
          <input
            id="rate-slider"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={voiceParams.rate}
            onChange={(e) => handleVoiceParamChange('rate', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
        
        {/* Pitch Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="pitch-slider" className="block text-xs font-medium text-gray-700">Pitch: {voiceParams.pitch.toFixed(1)}</label>
            <button 
              onClick={() => handleVoiceParamChange('pitch', 1.0)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          </div>
          <input
            id="pitch-slider"
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={voiceParams.pitch}
            onChange={(e) => handleVoiceParamChange('pitch', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
        
        {/* Volume Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="volume-slider" className="block text-xs font-medium text-gray-700">Volume: {Math.round(voiceParams.volume * 100)}%</label>
            <button 
              onClick={() => handleVoiceParamChange('volume', 1.0)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          </div>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={voiceParams.volume}
            onChange={(e) => handleVoiceParamChange('volume', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Quiet</span>
            <span>Loud</span>
          </div>
        </div>
        
        {/* Test Voice Button */}
        <button
          onClick={testVoice}
          className="w-full py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
        >
          Test Voice
        </button>
      </div>
    </div>
  );
} 