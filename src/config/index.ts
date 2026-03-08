/**
 * Cấu hình ứng dụng (env). Import khi cần.
 */
export const appConfig = {
  port: Number(process.env.PORT) || 3001,
  corsOrigin: process.env.CORS_ORIGIN,
  localeHeader: process.env.LOCALE_HEADER || 'x-locale',
  defaultLocale: process.env.DEFAULT_LOCALE || 'vi',
  isProduction: process.env.NODE_ENV === 'production',
};
