import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from '../components/LanguageToggle';
import DocumentWallet from '../components/DocumentWallet';
import FindMyScheme from '../components/FindMyScheme';
import { Mic, MicOff, Volume2, Square } from 'lucide-react';
import '../wallet.css';

const API = '/api/schemes';

/* ── Category Card ─────────────────────────────────────────────────── */
function CategoryCard({ category, lang, onClick }) {
    return (
        <button
            className="category-card"
            onClick={() => onClick(category)}
            aria-label={category[`name_${lang}`]}
        >
            <span className="category-card-icon">{category.icon}</span>
            <span className="category-card-name">{category[`name_${lang}`]}</span>
        </button>
    );
}

/* ── Scheme Card ────────────────────────────────────────────────────── */
function SchemeCard({ scheme, lang, t, onToggle }) {
    // Correctly fallback to different potential field names from the JSON
    const schemeName = scheme[`name_${lang}`] || scheme[`scheme_name_${lang}`] || scheme[`scheme_name`] || scheme[`name_en`];
    const schemeDesc = scheme[`description_${lang}`] || scheme[`description_en`] || scheme[`description`];
    
    return (
        <div className="scheme-card">
            <div className="scheme-card-header">
                <h4 className="scheme-card-title">{schemeName}</h4>
                <a
                    href={scheme.link || scheme.apply_link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scheme-apply-btn"
                >
                    {t('apply_now')} ↗
                </a>
            </div>

            <p className="scheme-card-desc" style={{ flex: 1 }}>{schemeDesc}</p>

            <div className="scheme-card-actions">
                <button
                    className="scheme-action-btn docs-btn"
                    onClick={() => onToggle(scheme, 'docs')}
                >
                    <span style={{ fontSize: '1.1rem' }}>📄</span>
                    {t('required_docs')}
                </button>
                <button
                    className="scheme-action-btn elig-btn"
                    onClick={() => onToggle(scheme, 'elig')}
                >
                    <span style={{ fontSize: '1.1rem', color: '#10b981' }}>✅</span>
                    {t('eligibility')}
                </button>
            </div>
        </div>
    );
}

/* ── Scheme Modal ───────────────────────────────────────────────────── */
function SchemeModal({ scheme, type, lang, t, onClose }) {
    if (!scheme) return null;

    const schemeName = scheme[`name_${lang}`] || scheme[`scheme_name_${lang}`] || scheme[`scheme_name`] || scheme[`name_en`];
    
    // Robust check for eligibility regardless of exact field name
    const eligibilityItems = scheme[`eligibility_${lang}`] || 
                             scheme[`eligibility_en`] || 
                             scheme[`eligibility`] || 
                             scheme[`requirements_${lang}`] || 
                             [];

    // Robust check for documents regardless of exact field name
    const documentItems = scheme.documents || 
                          scheme.required_documents || 
                          scheme[`documents_${lang}`] || 
                          scheme.docs || 
                          [];

    const isDocs = type === 'docs';
    const items = isDocs ? documentItems : eligibilityItems;
    const title = isDocs ? t('required_docs') : t('eligibility');
    const icon = isDocs ? '📄' : '✅';
    const emptyMsg = isDocs ? t('no_requirements') : t('no_eligibility');
    const accentColor = isDocs ? '#3b82f6' : '#10b981';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ borderBottomColor: accentColor + '33' }}>
                    <div className="modal-title-row">
                        <span className="modal-top-icon">{icon}</span>
                        <h3 className="modal-title">{title}</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>
                
                <div className="modal-body">
                    <div className="modal-scheme-info">
                        <span className="modal-scheme-label">{t('scheme_name')}</span>
                        <h4 className="modal-scheme-name">{schemeName}</h4>
                    </div>

                    <div className="modal-list-container">
                        <ul className="modal-list">
                            {items.length > 0 ? (
                                items.map((item, i) => (
                                    <li key={i} className="modal-list-item">
                                        <span className={`modal-item-dot ${!isDocs ? 'green' : ''}`}></span>
                                        {item}
                                    </li>
                                ))
                            ) : (
                                <li className="modal-list-empty">{emptyMsg}</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <a
                        href={scheme.link || scheme.apply_link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="modal-apply-btn"
                        style={{ backgroundColor: accentColor }}
                    >
                        {t('apply_now')} ↗
                    </a>
                    <button className="modal-secondary-btn" onClick={onClose}>{t('close')}</button>
                </div>
            </div>
        </div>
    );
}

/* ── Chat Message ───────────────────────────────────────────────────── */
function ChatMessage({ msg, lang, t, categories, onCategorySelect, onToggle }) {
    const mainCats = (categories || []).filter(c => c.isMain);
    const otherCats = (categories || []).filter(c => !c.isMain);

    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className={`chat-msg-row ${msg.type === 'user' ? 'chat-user' : 'chat-bot'}`}>
            <div className={`chat-avatar ${msg.type}`}>
                {msg.type === 'user' ? '👤' : '🤖'}
            </div>
            <div className="chat-bubble-wrapper">
                {msg.text && (
                    <div className={`chat-bubble ${msg.type}`}>
                        {msg.type === 'bot' ? (
                            <div className="bot-msg-content">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                <button
                                    className="speak-btn"
                                    onClick={() => speak(msg.text)}
                                    title={t('voice_speak')}
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                        ) : msg.text}
                    </div>
                )}

                {/* Categories Grid */}
                {msg.showCategories && categories && (
                    <div className="chat-categories-block">
                        <p className="chat-categories-label">{t('main_categories')}</p>
                        <div className="chat-categories-grid">
                            {mainCats.map(c => (
                                <CategoryCard
                                    key={c.id}
                                    category={c}
                                    lang={lang}
                                    onClick={onCategorySelect}
                                />
                            ))}
                        </div>
                        {otherCats.length > 0 && (
                            <>
                                <p className="chat-categories-label others-label">{t('others')}</p>
                                <div className="chat-categories-others">
                                    {otherCats.map(c => (
                                        <button
                                            key={c.id}
                                            className="category-pill"
                                            onClick={() => onCategorySelect(c)}
                                        >
                                            {c.icon} {c[`name_${lang}`]}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Inline Schemes (from search) */}
                {msg.schemes && msg.schemes.length > 0 && (
                    <div className="chat-schemes-list">
                        {msg.schemes.map(s => (
                            <SchemeCard 
                                key={s._id || s.id} 
                                scheme={s} 
                                lang={lang} 
                                t={t} 
                                onToggle={onToggle}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Dashboard ──────────────────────────────────────────────────────── */
export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const { token, logout, user } = useAuth();
    const lang = i18n.language?.startsWith('ta') ? 'ta' : 'en';

    const [messages, setMessages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [schemes, setSchemes] = useState([]);
    const [schemesLoading, setSchemesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [view, setView] = useState('chat'); // 'chat' | 'schemes'
    const [selectedScheme, setSelectedScheme] = useState(null); // { scheme, type }
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch categories on mount
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API}/categories`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategories(res.data);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        };
        fetch();

        // Initial greeting
        setTimeout(() => {
            setMessages([{ type: 'bot', text: t('bot_greeting') }]);
        }, 300);
    }, [token]);

    // When language changes, update greeting
    useEffect(() => {
        setMessages([{ type: 'bot', text: t('bot_greeting') }]);
    }, [i18n.language]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, schemes]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    // Sync Speech Recognition language with current app language
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
        }
    }, [lang]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (!recognitionRef.current) {
                alert(t('voice_unsupported'));
                return;
            }
            // Language is already synced in useEffect, but we can set it here too for safety
            recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error('Failed to start recognition:', err);
                setIsListening(false);
            }
        }
    };

    const addBotMessage = (text, extra = {}) => {
        setMessages(prev => [...prev, { type: 'bot', text, ...extra }]);
    };

    const addUserMessage = (text) => {
        setMessages(prev => [...prev, { type: 'user', text }]);
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        const msg = input.trim();
        if (!msg) return;

        addUserMessage(msg);
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post(`/api/chat/message`, {
                message: msg,
                lang: lang
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsTyping(false);

            // The API handles both Greetings and Search
            addBotMessage(res.data.text, {
                showCategories: res.data.showCategories || false,
                schemes: res.data.schemes || []
            });

        } catch (err) {
            setIsTyping(false);
            addBotMessage(t('search_error'));
            console.error("AI API Error:", err);
        }
    };

    const handleFormSubmit = async (formData, isPureAI = false) => {
        const prompt = lang === 'ta' 
            ? `என் பெயர் ${formData.fullName}, வயது ${formData.age}, பாலினம் ${formData.gender}, மதம் ${formData.religion}, சமூகம் ${formData.community}, வருமானம் ${formData.income}, திருமண நிலை ${formData.maritalStatus}, வேலை ${formData.employment}, கல்வி ${formData.education}, மாற்றுத்திறனாளி: ${formData.differentlyAbled === 'yes' ? 'ஆம்' : 'இல்லை'}. எனக்கான தகுதியான திட்டங்களை கூறு. (குறிப்பு: உங்கள் சொந்த அறிவில் இருந்தே பதிலளிக்கவும், டேட்டாபேஸை பார்க்க தேவையில்லை)`
            : `My name is ${formData.fullName}, age ${formData.age}, gender ${formData.gender}, religion ${formData.religion}, community ${formData.community}, income ${formData.income}, marital status ${formData.maritalStatus}, occupation ${formData.employment}, education ${formData.education}, differently abled: ${formData.differentlyAbled === 'yes' ? 'Yes' : 'No'}. Please find suitable schemes for me. (Note: Provide suggestions solely from your knowledge as an AI, ignoring the local database context).`;

        if (!isPureAI) {
            setView('chat');
            setSidebarOpen(false);
            addUserMessage(lang === 'ta' ? 'எனக்கான திட்டங்களை தேடு (பைண்ட் மை ஸ்கீம்)...' : 'Find schemes for my profile (Find My Scheme)...');
            setIsTyping(true);
        }

        try {
            const res = await axios.post(`/api/chat/message`, {
                message: prompt,
                lang: lang
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (isPureAI) {
                return res.data.text;
            }

            setIsTyping(false);
            addBotMessage(res.data.text, {
                showCategories: res.data.showCategories || false,
                schemes: res.data.schemes || []
            });

        } catch (err) {
            if (isPureAI) throw err;
            setIsTyping(false);
            addBotMessage(t('search_error'));
            console.error("AI API Error form:", err);
        }
    };

    const handleCategorySelect = async (category) => {
        setSelectedCategory(category);
        setView('schemes');
        setSchemesLoading(true);
        setSchemes([]);

        addUserMessage(category[`name_${lang}`]);
        addBotMessage(`${t('loading_schemes')} ${category[`name_${lang}`]}...`);

        try {
            const res = await axios.get(`${API}/category/${category.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchemes(res.data);
        } catch (err) {
            console.error('Failed to fetch schemes', err);
        } finally {
            setSchemesLoading(false);
        }
    };

    const handleBack = () => {
        setView('chat');
        setSelectedCategory(null);
        setSchemes([]);
    };

    const handleWalletSelect = () => {
        setView('wallet');
        setSelectedCategory(null);
        setSchemes([]);
        setSidebarOpen(false);
    };

    const handleFindSchemeSelect = () => {
        setView('find_scheme');
        setSelectedCategory(null);
        setSchemes([]);
        setSidebarOpen(false);
    };

    const filteredSchemes = schemes.filter(s => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            s.scheme_name_en?.toLowerCase().includes(q) ||
            s.scheme_name_ta?.includes(q) ||
            s.description_en?.toLowerCase().includes(q) ||
            s.description_ta?.includes(q)
        );
    });

    const quickChips = [t('chip_hi'), t('chip_education'), t('chip_health'), t('chip_farmers'), t('chip_pension')];

    return (
        <div className="dashboard">
            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="sidebar-logo-icon">🏛️</span>
                        <div>
                            <h1 className="sidebar-title">TN Scheme Bot</h1>
                            <p className="sidebar-tagline">{t('app_subtitle')}</p>
                        </div>
                    </div>
                </div>

                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {user?.name?.[0]?.toUpperCase() || '👤'}
                    </div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">{user?.name || 'User'}</p>
                        <p className="sidebar-user-email">{user?.email || ''}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <p className="sidebar-nav-label">{t('others')}</p>
                    <button
                        className={`sidebar-nav-item ${view === 'wallet' ? 'active' : ''}`}
                        onClick={handleWalletSelect}
                    >
                        <span className="sidebar-nav-icon">🗂️</span>
                        <span>{lang === 'ta' ? 'ஆவணங்கள்' : 'Document Wallet'}</span>
                    </button>
                    <button
                        className={`sidebar-nav-item ${view === 'find_scheme' ? 'active' : ''}`}
                        onClick={handleFindSchemeSelect}
                    >
                        <span className="sidebar-nav-icon">🔍</span>
                        <span>{lang === 'ta' ? 'எனது திட்டத்தை தேடு' : 'Find My Scheme'}</span>
                    </button>

                    <p className="sidebar-nav-label">{t('categories')}</p>
                    {categories.filter(c => c.isMain).map(cat => (
                        <button
                            key={cat.id}
                            className={`sidebar-nav-item ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                            onClick={() => {
                                handleCategorySelect(cat);
                                setSidebarOpen(false);
                            }}
                        >
                            <span className="sidebar-nav-icon">{cat.icon}</span>
                            <span>{cat[`name_${lang}`]}</span>
                        </button>
                    ))}
                    {categories.filter(c => !c.isMain).length > 0 && (
                        <>
                            <p className="sidebar-nav-label">{t('others')}</p>
                            {categories.filter(c => !c.isMain).map(cat => (
                                <button
                                    key={cat.id}
                                    className={`sidebar-nav-item ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                                    onClick={() => {
                                        handleCategorySelect(cat);
                                        setSidebarOpen(false);
                                    }}
                                >
                                    <span className="sidebar-nav-icon">{cat.icon}</span>
                                    <span>{cat[`name_${lang}`]}</span>
                                </button>
                            ))}
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <LanguageToggle />
                    <button onClick={logout} className="sidebar-logout-btn">
                        🚪 {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Main Content ─────────────────────────────────────── */}
            <div className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <button
                            className="hamburger-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle sidebar"
                        >
                            ☰
                        </button>
                        <div className="header-title-block">
                            <h2 className="header-title">
                                {view === 'schemes' && selectedCategory
                                    ? `${selectedCategory.icon} ${selectedCategory[`name_${lang}`]}`
                                    : view === 'wallet'
                                        ? `🗂️ ${lang === 'ta' ? 'ஆவணங்கள்' : 'Document Wallet'}`
                                        : view === 'find_scheme'
                                            ? `🔍 ${lang === 'ta' ? 'எனது திட்டத்தை தேடு' : 'Find My Scheme'}`
                                            : `🤖 ${t('chatbot_title')}`}
                            </h2>
                            {view === 'schemes' && selectedCategory && (
                                <p className="header-subtitle">
                                    {schemes.length} {t('schemes_found')}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="header-right">
                        <LanguageToggle />
                        <button onClick={logout} className="header-logout-btn" title={t('logout')}>
                            🚪 <span className="hidden-mobile">{t('logout')}</span>
                        </button>
                    </div>
                </header>

                {/* ── Chat View ─────────────────────────────────────── */}
                {view === 'chat' && (
                    <div className="chat-area">
                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <ChatMessage
                                    key={idx}
                                    msg={msg}
                                    lang={lang}
                                    t={t}
                                    categories={categories}
                                    onCategorySelect={handleCategorySelect}
                                    onToggle={(scheme, type) => setSelectedScheme({ scheme, type })}
                                />
                            ))}
                            {isTyping && (
                                <div className="chat-msg-row chat-bot">
                                    <div className="chat-avatar bot">🤖</div>
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Chips */}
                        <div className="chat-chips">
                            {quickChips.map((chip, i) => (
                                <button
                                    key={i}
                                    className="chat-chip"
                                    onClick={() => {
                                        setInput(chip);
                                        setTimeout(() => {
                                            inputRef.current?.form?.requestSubmit();
                                        }, 0);
                                    }}
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="chat-input-area">
                            <form onSubmit={handleSend} className="chat-input-form">
                                <button
                                    type="button"
                                    className={`voice-btn ${isListening ? 'listening' : ''}`}
                                    onClick={toggleListening}
                                    title={isListening ? t('voice_listening') : t('voice_input_idle')}
                                >
                                    {isListening ? <Square size={18} fill="currentColor" /> : <Mic size={20} />}
                                </button>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isListening ? t('voice_listening') : t('search_placeholder')}
                                    className="chat-input"
                                    autoComplete="off"
                                />
                                <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
                                    ➤
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Schemes View ──────────────────────────────────── */}
                {view === 'schemes' && (
                    <div className="schemes-area">
                        <div className="schemes-toolbar">
                            <button className="back-btn" onClick={handleBack}>
                                ← {t('back')}
                            </button>
                            <div className="schemes-search-wrapper">
                                <span className="schemes-search-icon">🔍</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('filter_schemes')}
                                    className="schemes-search-input"
                                />
                            </div>
                        </div>

                        {schemesLoading ? (
                            <div className="schemes-loading">
                                <div className="schemes-spinner"></div>
                                <p>{t('loading_schemes')}...</p>
                            </div>
                        ) : (
                            <div className="schemes-grid">
                                {filteredSchemes.length === 0 ? (
                                    <div className="schemes-empty">
                                        <span>🔍</span>
                                        <p>{t('no_schemes_found')}</p>
                                    </div>
                                ) : (
                                    filteredSchemes.map(s => (
                                        <SchemeCard 
                                            key={s._id} 
                                            scheme={s} 
                                            lang={lang} 
                                            t={t} 
                                            onToggle={(scheme, type) => setSelectedScheme({ scheme, type })}

                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Wallet View ─────────────────────────────────────── */}
                {view === 'wallet' && (
                    <div className="schemes-area">
                        <div className="schemes-toolbar">
                            <button className="back-btn" onClick={handleBack}>
                                ← {t('back')}
                            </button>
                        </div>
                        <DocumentWallet t={t} lang={lang} />
                    </div>
                )}

                {/* ── Find My Scheme View ─────────────────────────────────────── */}
                {view === 'find_scheme' && (
                    <div className="schemes-area">
                        <div className="schemes-toolbar">
                            <button className="back-btn" onClick={handleBack}>
                                ← {t('back')}
                            </button>
                        </div>
                        <FindMyScheme onSubmitForm={handleFormSubmit} t={t} lang={lang} />
                    </div>
                )}

                {selectedScheme && (
                    <SchemeModal 
                        scheme={selectedScheme.scheme} 
                        type={selectedScheme.type} 
                        lang={lang} 
                        t={t} 
                        onClose={() => setSelectedScheme(null)} 
                    />
                )}
            </div>
        </div>
    );
}
