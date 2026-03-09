import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from '../components/LanguageToggle';

export default function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const oauthError = queryParams.get('error');

        if (token) {
            // ── Google OAuth success: token dropped into URL by server ──
            // Decode JWT to get name/email without a library call
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                login({ name: payload.name || 'Google User', email: payload.email || '' }, token);
            } catch {
                login({ name: 'Google User' }, token);
            }
            // Clean the URL so the token isn't visible or reused on refresh
            window.history.replaceState({}, document.title, '/');
            navigate('/dashboard', { replace: true });
        }

        if (oauthError) {
            // ── Google OAuth failed — show user-friendly message ─────────
            const msg = decodeURIComponent(oauthError);
            if (msg === 'access_denied') {
                setError(t('google_cancelled'));
            } else {
                setError(t('google_login_failed'));
            }
            // Clean the error param from URL
            window.history.replaceState({}, document.title, '/');
        }
    }, [location.search]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            if (res.data.success) {
                login({ name: res.data.name, email: res.data.email }, res.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || t('login_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="auth-page">
            {/* Animated Background */}
            <div className="auth-bg">
                <div className="auth-bg-orb orb-1"></div>
                <div className="auth-bg-orb orb-2"></div>
                <div className="auth-bg-orb orb-3"></div>
                <div className="auth-bg-grid"></div>
            </div>

            {/* Language Toggle */}
            <div className="auth-lang-toggle">
                <LanguageToggle />
            </div>

            <div className="auth-container">
                {/* Left Panel - Branding */}
                <div className="auth-brand-panel">
                    <div className="auth-brand-content">
                        <div className="auth-tn-emblem">🏛️</div>
                        <h1 className="auth-brand-title">{t('app_title')}</h1>
                        <p className="auth-brand-subtitle">{t('app_subtitle')}</p>
                        <div className="auth-brand-features">
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">🎯</span>
                                <span>{t('feature_1')}</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">📋</span>
                                <span>{t('feature_2')}</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">🌐</span>
                                <span>{t('feature_3')}</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">⚡</span>
                                <span>{t('feature_4')}</span>
                            </div>
                        </div>
                        <div className="auth-brand-badge">
                            <span>🇮🇳</span>
                            <span>{t('govt_badge')}</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="auth-form-panel">
                    <div className="auth-form-card">
                        <div className="auth-form-header">
                            <div className="auth-avatar">
                                <span>🔐</span>
                            </div>
                            <h2 className="auth-form-title">{t('welcome_back')}</h2>
                            <p className="auth-form-subtitle">{t('sign_in_to_continue')}</p>
                        </div>

                        {error && (
                            <div className="auth-error">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="form-label-icon">✉️</span>
                                    {t('email')}
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('email_placeholder')}
                                    className="form-input"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="form-label-icon">🔒</span>
                                    {t('password')}
                                </label>
                                <div className="form-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('password_placeholder')}
                                        className="form-input"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="form-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`auth-submit-btn ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-spinner"></span>
                                ) : (
                                    <>
                                        <span>{t('login')}</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>{t('or')}</span>
                        </div>

                        <button onClick={handleGoogleLogin} className="google-btn">
                            <svg width="20" height="20" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                            <span>{t('google_login')}</span>
                        </button>

                        <p className="auth-switch">
                            {t('no_account')}{' '}
                            <Link to="/register" className="auth-switch-link">
                                {t('register')} →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
