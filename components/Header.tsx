
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { Language, Translations } from '../localization';

interface HeaderProps {
    t: Translations;
    lang: Language;
    setLang: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ t, lang, setLang }) => {
    const toggleLanguage = () => {
        setLang(lang === 'en' ? 'ar' : 'en');
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <LogoIcon className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 ms-3">
                        {t.headerTitle}
                    </h1>
                </div>
                <button
                    onClick={toggleLanguage}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    {t.language}
                </button>
            </div>
        </header>
    );
};
