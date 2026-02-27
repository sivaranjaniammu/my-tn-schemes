import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
    const { i18n } = useTranslation();
    const isEnglish = i18n.language?.startsWith('en');

    const toggle = () => {
        i18n.changeLanguage(isEnglish ? 'ta' : 'en');
    };

    return (
        <button
            onClick={toggle}
            className="lang-toggle-btn"
            title={isEnglish ? 'Switch to Tamil' : 'ஆங்கிலத்திற்கு மாறு'}
            aria-label="Toggle Language"
        >
            <span className="lang-globe">🌐</span>
            <span className="lang-current">{isEnglish ? 'EN' : 'தமிழ்'}</span>
            <span className="lang-arrow">⇄</span>
            <span className="lang-other">{isEnglish ? 'தமிழ்' : 'EN'}</span>
        </button>
    );
}
