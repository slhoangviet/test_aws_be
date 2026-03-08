import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DEFAULT_LOCALE, LOCALE_HEADER, type Locale } from '../constants';

/**
 * Lấy locale từ request: header x-locale hoặc Accept-Language (đoạn đầu).
 */
export function getLocaleFromRequest(headers: Record<string, string | undefined>): Locale {
  const x = headers[LOCALE_HEADER]?.toLowerCase()?.trim();
  if (x === 'vi' || x === 'en') return x;
  const accept = headers['accept-language']?.split(',')[0]?.trim()?.toLowerCase();
  if (accept?.startsWith('vi')) return 'vi';
  if (accept?.startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
}

export const LocaleParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Locale => {
    const req = ctx.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    return getLocaleFromRequest(req.headers ?? {});
  },
);
