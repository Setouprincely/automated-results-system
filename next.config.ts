// next.config.ts
import type { NextConfig } from 'next';
import { i18nConfig } from './next-i18next.config';

const nextConfig: NextConfig = {
  i18n: i18nConfig.i18n, // Use the i18n property from i18nConfig
};

export default nextConfig;