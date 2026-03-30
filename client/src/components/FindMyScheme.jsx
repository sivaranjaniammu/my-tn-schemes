import React, { useState } from 'react';
import GeminiSuggestions from './GeminiSuggestions';
import GeminiLoading from './GeminiLoading';

export default function FindMyScheme({ t, lang, onSubmitForm }) {
    const [view, setView] = useState('form'); // 'form' | 'results'
    const [aiResponse, setAiResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: '',
        religion: '',
        community: '',
        income: '',
        maritalStatus: '',
        employment: '',
        education: '',
        differentlyAbled: 'no',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setView('results');

        try {
            if (onSubmitForm) {
                const response = await onSubmitForm(formData, true);
                setAiResponse(response);
            }
        } catch (err) {
            setAiResponse(lang === 'ta' ? 'AI தரவுகளை பெறுவதில் சிக்கல் ஏற்பட்டுள்ளது.' : 'Error getting AI response.');
        } finally {
            setLoading(false);
        }
    };

    if (view === 'results') {
        if (loading) {
            return <GeminiLoading lang={lang} />;
        }
        return (
            <GeminiSuggestions 
                suggestions={aiResponse} 
                lang={lang} 
                onBack={() => setView('form')} 
            />
        );
    }

    return (
        <div style={{ 
            padding: '2rem 1.5rem', 
            height: '100%',
            overflowY: 'auto', 
            width: '100%',
            boxSizing: 'border-box',
            scrollBehavior: 'smooth'
        }}>
            <div 
                style={{ 
                    maxWidth: '850px', 
                    margin: '0 auto 5rem auto', // Bottom margin for button visibility
                    width: '100%', 
                    background: '#1e293b', 
                    borderRadius: '24px', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
                    border: '1px solid #334155',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header Section */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
                    padding: '2rem', 
                    textAlign: 'center',
                    borderBottom: '1px solid #3b82f6'
                }}>
                    <h2 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '2rem' }}>🔍</span> 
                        {lang === 'ta' ? 'திட்டங்கள் தேடல்' : 'Find My Scheme'}
                    </h2>
                    <p style={{ color: '#bfdbfe', margin: 0, fontSize: '1.05rem', fontWeight: '500' }}>
                        {lang === 'ta' 
                            ? 'உங்களுக்கு பொருத்தமான அரசு திட்டங்களை அறிய, உங்கள் விவரங்களை உள்ளிடவும்.' 
                            : 'Enter your details below to discover government schemes tailored to your eligibility.'}
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} style={{ padding: '2.5rem' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem 2rem' }}>
                        
                        {/* Full Name */}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
                                {lang === 'ta' ? 'முழு பெயர்' : 'Full Name'} <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <input 
                                type="text" 
                                name="fullName" 
                                value={formData.fullName} 
                                onChange={handleChange} 
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', 
                                    border: '1px solid #475569', background: '#0f172a', color: 'white', 
                                    fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                                placeholder={lang === 'ta' ? 'உங்கள் பெயர்' : 'Enter your name'} 
                                required 
                            />
                        </div>

                        {/* Age */}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
                                {lang === 'ta' ? 'வயது' : 'Age'} <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <input 
                                type="number" 
                                name="age" 
                                value={formData.age} 
                                onChange={handleChange} 
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', 
                                    border: '1px solid #475569', background: '#0f172a', color: 'white', 
                                    fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                                placeholder={lang === 'ta' ? 'உங்களின் வயது (எ.கா: 35)' : 'Enter your age (e.g. 35)'} 
                                min="0" 
                                max="120"
                                required 
                            />
                        </div>

                        {/* Gender */}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
                                {lang === 'ta' ? 'பாலினம்' : 'Gender'} <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <select 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleChange} 
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', 
                                    border: '1px solid #475569', background: '#0f172a', color: 'white', 
                                    fontSize: '1rem', outline: 'none', cursor: 'pointer',
                                    transition: 'border-color 0.2s', boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                                required
                            >
                                <option value="" disabled>{lang === 'ta' ? '-- தேர்ந்தெடுக்கவும் --' : '-- Select Gender --'}</option>
                                <option value="male">{lang === 'ta' ? 'ஆண்' : 'Male'}</option>
                                <option value="female">{lang === 'ta' ? 'பெண்' : 'Female'}</option>
                                <option value="transgender">{lang === 'ta' ? 'திருநங்கை' : 'Transgender'}</option>
                            </select>
                        </div>

                        {/* Religion */}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
                                {lang === 'ta' ? 'மதம்' : 'Religion'} <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <select 
                                name="religion" 
                                value={formData.religion} 
                                onChange={handleChange} 
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', 
                                    border: '1px solid #475569', background: '#0f172a', color: 'white', 
                                    fontSize: '1rem', outline: 'none', cursor: 'pointer',
                                    transition: 'border-color 0.2s', boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                                required
                            >
                                <option value="" disabled>{lang === 'ta' ? '-- தேர்ந்தெடுக்கவும் --' : '-- Select Religion --'}</option>
                                <option value="hindu">{lang === 'ta' ? 'இந்து' : 'Hindu'}</option>
                                <option value="muslim">{lang === 'ta' ? 'முஸ்லிம்' : 'Muslim'}</option>
                                <option value="christian">{lang === 'ta' ? 'கிறிஸ்தவர்' : 'Christian'}</option>
                                <option value="sikh">{lang === 'ta' ? 'சீக்கியர்' : 'Sikh'}</option>
                                <option value="buddhist">{lang === 'ta' ? 'பௌத்தர்' : 'Buddhist'}</option>
                                <option value="jain">{lang === 'ta' ? 'சமணர்' : 'Jain'}</option>
                                <option value="other">{lang === 'ta' ? 'மற்றவை' : 'Other'}</option>
                            </select>
                        </div>

                        {/* Community Category */}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
                                {lang === 'ta' ? 'சமூகப் பிரிவு (Community)' : 'Community Category'} <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <select 
                                name="community" 
                                value={formData.community} 
                                onChange={handleChange} 
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', 
                                    border: '1px solid #475569', background: '#0f172a', color: 'white', 
                                    fontSize: '1rem', outline: 'none', cursor: 'pointer',
                                    transition: 'border-color 0.2s', boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                                required
                            >
                                <option value="" disabled>{lang === 'ta' ? '-- தேர்ந்தெடுக்கவும் --' : '-- Select Community --'}</option>
                                <option value="oc">{lang === 'ta' ? 'பொதுப் பிரிவு (OC / General)' : 'OC / General'}</option>
                                <option value="bc">{lang === 'ta' ? 'பிற்படுத்தப்பட்டோர் (BC)' : 'Backward Class (BC)'}</option>
                                <option value="bcm">{lang === 'ta' ? 'பிற்படுத்தப்பட்டோர் - இஸ்லாமியர் (BCM)' : 'Backward Class Muslim (BCM)'}</option>
                                <option value="mbc">{lang === 'ta' ? 'மிகவும் பிற்படுத்தப்பட்டோர் (MBC / DNC)' : 'Most Backward Class (MBC / DNC)'}</option>
                                <option value="sc">{lang === 'ta' ? 'பட்டியல் சாதியினர் (SC)' : 'Scheduled Caste (SC)'}</option>
                                <option value="sca">{lang === 'ta' ? 'பட்டியல் சாதியினர் - அருந்ததியர் (SCA)' : 'SC - Arunthathiyar (SCA)'}</option>
                                <option value="st">{lang === 'ta' ? 'பழங்குடியினர் (ST)' : 'Scheduled Tribe (ST)'}</option>
                            </select>
                        </div>

                        {/* Annual Income */}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
                                {lang === 'ta' ? 'ஆண்டு வருமானம் (₹)' : 'Annual Income (₹)'} <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <input 
                                type="number" 
                                name="income" 
                                value={formData.income} 
                                onChange={handleChange} 
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', 
                                    border: '1px solid #475569', background: '#0f172a', color: 'white', 
                                    fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                                placeholder={lang === 'ta' ? 'எ.கா: 120000' : 'E.g: 120000'} 
                                min="0" 
                                required 
                            />
                        </div>

                        {/* Marital Status */}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
                                {lang === 'ta' ? 'திருமண நிலை' : 'Marital Status'} <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <select 
                                name="maritalStatus" 
                                value={formData.maritalStatus} 
                                onChange={handleChange} 
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', 
                                    border: '1px solid #475569', background: '#0f172a', color: 'white', 
                                    fontSize: '1rem', outline: 'none', cursor: 'pointer',
                                    transition: 'border-color 0.2s', boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                                required
                            >
                                <option value="" disabled>{lang === 'ta' ? '-- தேர்ந்தெடுக்கவும் --' : '-- Select Status --'}</option>
                                <option value="single">{lang === 'ta' ? 'மணமாகாதவர்' : 'Single'}</option>
                                <option value="married">{lang === 'ta' ? 'திருமணமானவர்' : 'Married'}</option>
                                <option value="widow">{lang === 'ta' ? 'கணவரை / மனைவியை இழந்தவர் (Widowed)' : 'Widowed'}</option>
                                <option value="divorced">{lang === 'ta' ? 'விவாகரத்து பெற்றவர் (Divorced)' : 'Divorced / Separated'}</option>
                            </select>
                        </div>

                        {/* Employment Status */}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
                                {lang === 'ta' ? 'வேலைவாய்ப்பு / தொழில்' : 'Employment / Occupation'} <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <input 
                                type="text" 
                                name="employment" 
                                value={formData.employment} 
                                onChange={handleChange} 
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', 
                                    border: '1px solid #475569', background: '#0f172a', color: 'white', 
                                    fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                                placeholder={lang === 'ta' ? 'எ.கா: விவசாயி, மாணவர், தையல்கலை' : 'E.g: Farmer, Student, Tailor'} 
                                required 
                            />
                        </div>

                        {/* Education Level */}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
                                {lang === 'ta' ? 'கல்வி தகுதி' : 'Education Level'} <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <select 
                                name="education" 
                                value={formData.education} 
                                onChange={handleChange} 
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', 
                                    border: '1px solid #475569', background: '#0f172a', color: 'white', 
                                    fontSize: '1rem', outline: 'none', cursor: 'pointer',
                                    transition: 'border-color 0.2s', boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                                required
                            >
                                <option value="" disabled>{lang === 'ta' ? '-- தேர்ந்தெடுக்கவும் --' : '-- Select Education --'}</option>
                                <option value="illiterate">{lang === 'ta' ? 'படிக்காதவர்' : 'No Formal Education'}</option>
                                <option value="primary">{lang === 'ta' ? 'தொடக்கக் கல்வி (1-5)' : 'Primary (1-5)'}</option>
                                <option value="middle">{lang === 'ta' ? 'நடுநிலைக் கல்வி (6-8)' : 'Middle (6-8)'}</option>
                                <option value="secondary">{lang === 'ta' ? 'பள்ளி படிப்பு (10th / 12th)' : 'High Secondary (10th / 12th)'}</option>
                                <option value="diploma">{lang === 'ta' ? 'பட்டயப்படிப்பு (Diploma/ITI)' : 'Diploma / ITI'}</option>
                                <option value="graduate">{lang === 'ta' ? 'இளங்கலை பட்டதாரி' : 'Under Graduate (UG)'}</option>
                                <option value="postgraduate">{lang === 'ta' ? 'முதுகலை பட்டதாரி' : 'Post Graduate (PG)'}</option>
                            </select>
                        </div>
                    </div>

                    {/* Horizontal Divider */}
                    <div style={{ height: '1px', background: '#334155', margin: '2rem 0' }}></div>

                    {/* Special Criteria */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
                        {/* Differently Abled Radio Buttons */}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '600' }}>
                                {lang === 'ta' ? 'நீங்கள் மாற்றுத்திறனாளியா?' : 'Are you Differently Abled?'}
                            </label>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', cursor: 'pointer', background: '#0f172a', padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #475569' }}>
                                    <input type="radio" name="differentlyAbled" value="yes" checked={formData.differentlyAbled === 'yes'} onChange={handleChange} style={{ accentColor: '#3b82f6', width: '18px', height: '18px', cursor: 'pointer' }} /> 
                                    {lang === 'ta' ? 'ஆம்' : 'Yes'}
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', cursor: 'pointer', background: '#0f172a', padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #475569' }}>
                                    <input type="radio" name="differentlyAbled" value="no" checked={formData.differentlyAbled === 'no'} onChange={handleChange} style={{ accentColor: '#3b82f6', width: '18px', height: '18px', cursor: 'pointer' }} /> 
                                    {lang === 'ta' ? 'இல்லை' : 'No'}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                maxWidth: '400px',
                                background: loading ? '#475569' : 'linear-gradient(to right, #2563eb, #3b82f6)', 
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px', 
                                padding: '1rem 2rem', 
                                fontSize: '1.15rem', 
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                                transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s'
                            }}
                            onMouseOver={(e) => {
                                if(!loading) {
                                  e.target.style.transform = 'translateY(-2px)';
                                  e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if(!loading) {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 4px 14px 0 rgba(59, 130, 246, 0.39)';
                                }
                            }}
                        >
                            {loading ? (lang === 'ta' ? 'தேடுகிறது...' : 'Finding...') : (lang === 'ta' ? 'FIND MY SCHEMES' : 'FIND MY SCHEMES')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
