import type { Config } from 'tailwindcss';
import baseConfig from '@microplanner/config/tailwind.config';

const config: Config = {
  ...baseConfig,
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
};

export default config;
