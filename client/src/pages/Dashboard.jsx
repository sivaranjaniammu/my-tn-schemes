import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from '../components/LanguageToggle';

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
function SchemeCard({ scheme, lang, t }) {
    const [activePanel, setActivePanel] = useState(null); // 'docs' | 'elig' | null

    const togglePanel = (panel) => {
        setActivePanel(prev => prev === panel ? null : panel);
    };

    return (
        <div className="scheme-card">
            <div className="scheme-card-header">
                <h4 className="scheme-card-title">{scheme[`scheme_name_${lang}`]}</h4>
                <a
                    href={scheme.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scheme-apply-btn"
                    title={t('apply_now')}
                >
                    {t('apply_now')} ↗
                </a>
            </div>

            <p className="scheme-card-desc">{scheme[`description_${lang}`]}</p>

            <div className="scheme-card-actions">
                <button
                    className={`scheme-action-btn docs-btn ${activePanel === 'docs' ? 'active' : ''}`}
                    onClick={() => togglePanel('docs')}
                >
                    📄 {t('required_docs')}
                    <span className="toggle-arrow">{activePanel === 'docs' ? '▲' : '▼'}</span>
                </button>
                <button
                    className={`scheme-action-btn elig-btn ${activePanel === 'elig' ? 'active' : ''}`}
                    onClick={() => togglePanel('elig')}
                >
                    ✅ {t('eligibility')}
                    <span className="toggle-arrow">{activePanel === 'elig' ? '▲' : '▼'}</span>
                </button>
            </div>

            {activePanel === 'docs' && (
                <div className="scheme-panel docs-panel">
                    <h5 className="scheme-panel-title">📄 {t('required_docs')}</h5>
                    <ul className="scheme-panel-list">
                        {(scheme.documents || []).map((doc, i) => (
                            <li key={i} className="scheme-panel-item">
                                <span className="item-dot"></span>
                                {doc}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activePanel === 'elig' && (
                <div className="scheme-panel elig-panel">
                    <h5 className="scheme-panel-title">✅ {t('eligibility')}</h5>
                    <ul className="scheme-panel-list">
                        {(scheme[`eligibility_${lang}`] || []).map((item, i) => (
                            <li key={i} className="scheme-panel-item">
                                <span className="item-dot green"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/* ── Chat Message ───────────────────────────────────────────────────── */
function ChatMessage({ msg, lang, t, categories, onCategorySelect }) {
    const mainCats = (categories || []).filter(c => c.isMain);
    const otherCats = (categories || []).filter(c => !c.isMain);

    return (
        <div className={`chat-msg-row ${msg.type === 'user' ? 'chat-user' : 'chat-bot'}`}>
            <div className={`chat-avatar ${msg.type}`}>
                {msg.type === 'user' ? '👤' : '🤖'}
            </div>
            <div className="chat-bubble-wrapper">
                {msg.text && (
                    <div className={`chat-bubble ${msg.type}`}>
                        {msg.text}
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
                            <SchemeCard key={s._id || s.id} scheme={s} lang={lang} t={t} />
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

        const greetings = ['hi', 'hello', 'வணக்கம்', 'hai', 'hey', 'start', 'தொடங்கு'];
        if (greetings.includes(msg.toLowerCase())) {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                addBotMessage(t('select_category'), { showCategories: true });
            }, 800);
        } else {
            // Search
            setIsTyping(true);
            try {
                const res = await axios.get(`${API}/search?q=${encodeURIComponent(msg)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsTyping(false);
                if (res.data.length > 0) {
                    addBotMessage(
                        `${t('found_results')} "${msg}":`,
                        { schemes: res.data }
                    );
                } else {
                    addBotMessage(t('no_results'));
                }
            } catch {
                setIsTyping(false);
                addBotMessage(t('search_error'));
            }
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
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={t('search_placeholder')}
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
                                        <SchemeCard key={s._id} scheme={s} lang={lang} t={t} />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
