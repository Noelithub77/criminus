'use client';

/**
 * Status bar component for displaying call status and controls
 */
export default function StatusBar({ 
  callStatus, 
  toggleVoiceSettings, 
  toggleInputMode, 
  inputMode,
  isRecording,
  isProcessing,
  isUploading,
  isRecordingAudio
}) {
  return (
    <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
      <div className="text-sm font-medium">
        {callStatus === 'idle' && 'Ready to call'}
        {callStatus === 'calling' && 'Calling dispatch...'}
        {callStatus === 'connected' && 'Connected to AI Dispatch'}
        {callStatus === 'ended' && 'Call ended'}
      </div>
      <div className="flex items-center gap-2">
        {callStatus === 'connected' && (
          <>
            <button 
              onClick={toggleVoiceSettings}
              className="text-xs px-2 py-1 bg-blue-700 rounded-full hover:bg-blue-800 flex items-center gap-1"
              aria-label="Voice settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
              Voice
            </button>
            <button 
              onClick={toggleInputMode}
              className="text-xs px-2 py-1 bg-blue-700 rounded-full hover:bg-blue-800"
            >
              {inputMode === 'unified' ? 'Switch to Text' : 'Switch to Voice'}
            </button>
          </>
        )}
        <div className="text-sm font-medium">
          {isRecording && 'Recording...'}
          {isProcessing && 'Processing...'}
          {isUploading && 'Uploading...'}
          {isRecordingAudio && 'Recording Audio...'}
        </div>
      </div>
    </div>
  );
} 