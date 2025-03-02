"use client";

export default function Loading() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="loading-spinner" style={{
        width: '50px',
        height: '50px',
        border: '5px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '50%',
        borderTop: '5px solid #3498db',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
      <p>Loading application...</p>
    </div>
  );
} 