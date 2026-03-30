import React from 'react';

export default function GeminiLoading({ lang }) {
    return (
        <div style={{ 
            height: '100%', 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#0f172a',
            padding: '2rem',
            textAlign: 'center'
        }}>
            {/* Spinning AI Core Visual */}
            <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '3rem' }}>
                {/* Outer Ring */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    border: '4px solid transparent',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 2s linear infinite'
                }} />
                {/* Inner Glow Ring */}
                <div style={{
                    position: 'absolute',
                    inset: '15px',
                    border: '4px solid transparent',
                    borderBottomColor: '#60a5fa',
                    borderRadius: '50%',
                    animation: 'spin 1.5s reverse linear infinite',
                    opacity: 0.6
                }} />
                {/* Center Pulse Core */}
                <div style={{
                    position: 'absolute',
                    inset: '35px',
                    background: 'radial-gradient(circle, #3b82f6 0%, #1e3a8a 100%)',
                    borderRadius: '50%',
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>✨</span>
                </div>
            </div>

            {/* Professional Text Content */}
            <div style={{ maxWidth: '400px' }}>
                <h3 style={{ 
                    color: 'white', 
                    fontSize: '1.5rem', 
                    fontWeight: '800', 
                    margin: '0 0 1rem',
                    letterSpacing: '-0.01em'
                }}>
                    {lang === 'ta' ? 'விவரங்களை பகுப்பாய்வு செய்கிறது...' : 'Analyzing Your Profile'}
                </h3>
                
                <p style={{ 
                    color: '#64748b', 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    lineHeight: '1.6',
                    margin: 0
                }}>
                    {lang === 'ta' 
                        ? 'எமது AI உதவியாளர் தங்களுக்குப் பொருத்தமான தமிழ்நாடு அரசுத் திட்டங்களைக் கண்டறிந்து கொண்டிருக்கிறது.' 
                        : 'Our Gemini AI assistant is carefully evaluating Tamil Nadu government databases for your eligible schemes.'}
                </p>

                {/* Progress Bar Animation */}
                <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    background: '#1e293b', 
                    borderRadius: '10px', 
                    marginTop: '2rem',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        height: '100%',
                        width: '40%',
                        background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                        borderRadius: '10px',
                        animation: 'shimmer 1.5s infinite linear'
                    }} />
                </div>
                
                <span style={{ 
                    display: 'inline-block', 
                    marginTop: '1.5rem', 
                    color: '#3b82f6', 
                    fontSize: '0.85rem', 
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    Gemini AI Active
                </span>
            </div>

            {/* Embedded CSS Animations */}
            <style>
                {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; filter: brightness(1.2); }
                    50% { transform: scale(1.15); opacity: 0.8; filter: brightness(1); }
                }
                @keyframes shimmer {
                    from { left: -50%; }
                    to { left: 150%; }
                }
                `}
            </style>
        </div>
    );
}
