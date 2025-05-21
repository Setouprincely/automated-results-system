// next-i18next.config.ts
import type { UserConfig } from 'next-i18next';

const i18n: UserConfig['i18n'] = {
  defaultLocale: 'en',
  locales: ['en', 'fr'],
};

export const i18nConfig: UserConfig = { i18n };
export default i18nConfig;