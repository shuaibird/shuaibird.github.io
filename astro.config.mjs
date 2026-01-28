import { defineConfig } from 'astro/config';
import themeTokyoNight from '@shikijs/themes/tokyo-night';

export default defineConfig({
  site: 'https://shuaibird.github.io',
  markdown: {
    shikiConfig: {
      theme: themeTokyoNight,
      wrap: true,
    },
  },
});
