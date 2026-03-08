import { Injectable } from '@nestjs/common';
import { translations, DEFAULT_LOCALE, type Locale } from './translations';

@Injectable()
export class I18nService {
  /**
   * Trả về bản dịch theo key và locale.
   * Nếu không có bản dịch thì trả về key hoặc bản dịch mặc định (vi).
   */
  t(key: string, locale?: Locale): string {
    const lang = locale && (locale === 'vi' || locale === 'en') ? locale : DEFAULT_LOCALE;
    const dict = translations[lang];
    if (dict && key in dict) return dict[key];
    const fallback = translations[DEFAULT_LOCALE];
    return (fallback && key in fallback ? fallback[key] : key) as string;
  }
}
