import React from 'react';

export default function GeminiSuggestions({ suggestions, lang, onBack }) {
    // Detect headings and lists to render structured content
    const formattedText = suggestions.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: '0.8rem' }} />;
        
        // Match bold markers or hashtags for sections
        if (trimmed.startsWith('**') || trimmed.startsWith('###')) {
            return (
                <h3 key={i} style={{ 
                    color: '#3b82f6', 
                    marginTop: '2rem', 
                    marginBottom: '1rem', 
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    borderLeft: '4px solid #3b82f6', 
                    paddingLeft: '14px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {trimmed.replace(/\*|#/g, '')}
                </h3>
            );
        }
        
        // Match list items
        if (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed)) {
            return (
                <li key={i} style={{ 
                    marginBottom: '0.6rem', 
                    marginLeft: '1.2rem', 
                    listStyleType: 'none',
                    position: 'relative',
                    color: '#f1f5f9'
                }}>
                    <span style={{ position: 'absolute', left: '-1.2rem', color: '#3b82f6' }}>•</span>
                    {trimmed.replace(/^-|•|^\d+\./, '').trim()}
                </li>
            );
        }
        
        return <p key={i} style={{ marginBottom: '1rem', color: '#cbd5e1', lineHeight: '1.7' }}>{trimmed}</p>;
    });

    return (
        <div style={{ padding: '2rem 1.5rem 4rem 1.5rem', flex: 1, overflowY: 'auto', background: '#0f172a' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                {/* Header Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <button 
                        onClick={onBack}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(59, 130, 246, 0.08)',
                            border: '1.5px solid #334155',
                            color: '#94a3b8',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: '600',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        ← {lang === 'ta' ? 'விவரங்களை மாற்ற' : 'Modify My Details'}
                    </button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Gemini AI Generation</span>
                    </div>
                </div>

                {/* Hero Title */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ 
                        width: '80px', height: '80px', 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)', 
                        borderRadius: '24px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                        transform: 'rotate(-5deg)'
                    }}>
                        <span style={{ fontSize: '2.5rem' }}>✨</span>
                    </div>
                    <h1 style={{ fontSize: '2.25rem', color: 'white', fontWeight: '900', margin: '0 0 1rem', letterSpacing: '-0.025em' }}>
                        {lang === 'ta' ? 'AI திட்டப் பரிந்துரைகள்' : 'Your AI-Curated Insights'}
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
                        {lang === 'ta' 
                            ? 'தங்களின் விவரங்களைக் கருத்தில் கொண்டு எமது AI கண்டறிந்த சிறந்த அரசு திட்டங்கள்.' 
                            : 'Based on your specific profile, our AI assistant has identified the following Tamil Nadu government initiatives for you.'}
                    </p>
                </div>

                {/* Main Results Container */}
                <div 
                    style={{ 
                        background: '#1e293b', 
                        padding: '3rem', 
                        borderRadius: '28px', 
                        color: '#f1f5f9',
                        border: '1px solid #334155',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Decorative Background Elements */}
                    <div style={{ 
                        position: 'absolute', top: '-10%', right: '-10%', 
                        width: '200px', height: '200px', 
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {formattedText}
                    </div>
                </div>

                {/* Footer Insight */}
                <div style={{ 
                    marginTop: '3.5rem', 
                    padding: '1.5rem', 
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '16px',
                    border: '1px dashed #334155',
                    color: '#64748b',
                    fontSize: '0.9rem'
                }}>
                    💡 {lang === 'ta' 
                        ? 'குறிப்பு: இவை AI மூலம் தானாகவே உருவாக்கப்பட்டவை. அதிகாரப்பூர்வ தகவல்களைத் துறை ரீதியாகச் சரிபார்ப்பது சிறந்தது.' 
                        : 'Insight: These suggestions are simulated by AI based on your input. We recommend verifying specific eligibility with relevant department officials.'}
                </div>
            </div>
        </div>
    );
}
