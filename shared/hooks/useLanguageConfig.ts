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
    'Hungarian',
    'Romanian',
    'Bulgarian',
    'Greek',
    'Turkish',
    'Japanese',
    'Chinese',
    'Korean',
    'Arabic',
    'Hebrew',
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