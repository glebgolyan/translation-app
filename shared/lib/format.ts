// Pages are server-rendered (on Vercel: UTC, en-US) and then hydrated in the
// staff's browser (Kyiv time, ru/uk locale). React requires both renders to
// produce identical text, so locale and time zone are pinned here rather than
// inherited from whichever runtime happens to be formatting.
export const APP_LOCALE = 'uk-UA';
// 'Europe/Kiev', not 'Europe/Kyiv': the old name is a permanent alias every
// engine knows, while older Safari/ICU builds throw on the new one.
export const APP_TIME_ZONE = 'Europe/Kiev';

export function formatDate(
  value: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
) {
  return new Date(value ?? NaN).toLocaleDateString(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    ...options,
  });
}
