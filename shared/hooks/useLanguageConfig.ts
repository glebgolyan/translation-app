'use client';
import { useT } from '@/shared/hooks/useT';

export const AVAILABLE_LANGUAGES = [
    'English',
    'Ukrainian',
    'Russian',
    'Polish',
    'German',
    'French',
    'Spanish',
    'Italian',
    'Portuguese',
    'Dutch',
    'Czech',
    'Slovak',
    'Hungarian',
    'Romanian',
    'Moldovan',
    'Bulgarian',
    'Serbian',
    'Croatian',
    'Bosnian',
    'Slovenian',
    'Montenegrin',
    'Macedonian',
    'Albanian',
    'Greek',
    'Turkish',

    'Lithuanian',
    'Latvian',
    'Estonian',
    'Finnish',
    'Swedish',
    'Norwegian',
    'Danish',
    'Icelandic',

    'Belarusian',
    'Armenian',
    'Azerbaijani',
    'Georgian',
    'Kazakh',
    'Uzbek',
    'Kyrgyz',
    'Tajik',
    'Turkmen',

    'Chinese',
    'Japanese',
    'Korean',
    'Vietnamese',
    'Thai',
    'Indonesian',
    'Malay',
    'Hindi',
    'Urdu',

    'Arabic',
    'Hebrew',
    'Persian',

    'Swahili',
    'Afrikaans',

    'Latin',
];

export function useLanguageConfig() {
    const { t } = useT();

    const getLanguageName = (lang: string) => {
        const key = `languages.${lang.toLowerCase()}`;
        return t(key) || lang;
    };

    const getLanguageList = () => {
        return AVAILABLE_LANGUAGES.map(lang => ({
            value: lang,
            label: getLanguageName(lang),
        }));
    };

    return {
        getLanguageName,
        getLanguageList,
        AVAILABLE_LANGUAGES,
    };
}