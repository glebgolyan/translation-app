'use client';
import { useLanguageStore } from '../stores/languageStore';
import en from '../../messages/en.json';
import uk from '../../messages/uk.json';
import ru from '../../messages/ru.json';

const messages = { en, uk, ru };

type NestedKeyOf<T> = T extends object
    ? { [K in keyof T]: K extends string
        ? T[K] extends object
            ? `${K}.${NestedKeyOf<T[K]>}`
            : K
        : never }[keyof T]
    : never;

type MessageKey = NestedKeyOf<typeof en>;

export function useT() {
    const locale = useLanguageStore(s => s.locale);
    const dict = messages[locale] as any;

    function t(key: string): string {
        const parts = key.split('.');
        let val: any = dict;
        for (const p of parts) {
            val = val?.[p];
        }
        return val ?? key;
    }

    return { t, locale };
}