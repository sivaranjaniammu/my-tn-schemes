import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from '../components/LanguageToggle';

export default function Register() {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const passwordStrength = () => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const getStrengthLabel = () => {
        const s = passwordStrength();
        if (s === 0) return '';
        if (s === 1) return t('strength_weak');
        if (s === 2) return t('strength_fair');
        if (s === 3) return t('strength_good');
        return t('strength_strong');
    };

    const getStrengthColor = () => {
        const s = passwordStrength();
        if (s === 1) return '#ef4444';
        if (s === 2) return '#f97316';
        if (s === 3) return '#eab308';
        if (s === 4) return '#22c55e';
        return '#e2e8f0';
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('password_mismatch'));
            return;
        }
        if (password.length < 8) {
            setError(t('password_too_short'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/register', { name, email, password });
            if (res.data.success) {
                login({ name: res.data.name, email: res.data.email }, res.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || t('register_failed'));
        } finally {
            setLoading(false);
        }
    };

    const strength = passwordStrength();

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

            <div className="auth-container auth-container-register">
                {/* Left Panel - Branding */}
                <div className="auth-brand-panel">
                    <div className="auth-brand-content">
                        <div className="auth-tn-emblem">🏛️</div>
                        <h1 className="auth-brand-title">{t('app_title')}</h1>
                        <p className="auth-brand-subtitle">{t('join_subtitle')}</p>
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
                                <span>✨</span>
                            </div>
                            <h2 className="auth-form-title">{t('create_account')}</h2>
                            <p className="auth-form-subtitle">{t('register_subtitle')}</p>
                        </div>

                        {error && (
                            <div className="auth-error">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="form-label-icon">👤</span>
                                    {t('name')}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('name_placeholder')}
                                    className="form-input"
                                    required
                                    autoComplete="name"
                                />
                            </div>

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
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="form-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {password && (
                                    <div className="password-strength">
                                        <div className="strength-bars">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className="strength-bar"
                                                    style={{
                                                        backgroundColor: i <= strength ? getStrengthColor() : '#e2e8f0'
                                                    }}
                                                ></div>
                                            ))}
                                        </div>
                                        <span className="strength-label" style={{ color: getStrengthColor() }}>
                                            {getStrengthLabel()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="form-label-icon">🔑</span>
                                    {t('confirm_password')}
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('confirm_password_placeholder')}
                                    className={`form-input ${confirmPassword && confirmPassword !== password ? 'input-error' : ''}`}
                                    required
                                    autoComplete="new-password"
                                />
                                {confirmPassword && confirmPassword !== password && (
                                    <p className="form-error-hint">{t('password_mismatch')}</p>
                                )}
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
                                        <span>{t('create_account')}</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="auth-switch">
                            {t('have_account')}{' '}
                            <Link to="/" className="auth-switch-link">
                                {t('login')} →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
