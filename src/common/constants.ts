/**
 * Hằng số dùng chung (BE).
 */
export const LOCALE_HEADER = 'x-locale';
export const DEFAULT_LOCALE = 'vi';
export const SUPPORTED_LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
