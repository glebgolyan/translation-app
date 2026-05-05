'use client';
import { HStack, Button, Text } from '@chakra-ui/react';
import { useLanguageStore, Locale } from '../stores/languageStore';

const LANGS: { value: Locale; label: string; flag: string }[] = [
    { value: 'en', label: 'EN', flag: '🇬🇧' },
    { value: 'uk', label: 'UA', flag: '🇺🇦' },
    { value: 'ru', label: 'RU', flag: '🇷🇺' },
];

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguageStore();

    return (
        <HStack spacing={1}>
            {LANGS.map(lang => (
                <Button
                    key={lang.value}
                    size="xs"
                    variant={locale === lang.value ? 'solid' : 'ghost'}
                    colorScheme={locale === lang.value ? 'brand' : 'gray'}
                    onClick={() => setLocale(lang.value)}
                    px={2}
                    fontSize="11px"
                    fontFamily="Syne"
                    fontWeight="700"
                >
                    {lang.flag} {lang.label}
                </Button>
            ))}
        </HStack>
    );
}