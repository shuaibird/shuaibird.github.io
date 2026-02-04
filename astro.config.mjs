import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import rehypeMermaid from 'rehype-mermaid';
import themeTokyoNight from '@shikijs/themes/tokyo-night';
import rehypeWrapMermaid from './src/plugins/rehype-wrap-mermaid';
import remarkMermaidResponsive from './src/plugins/remark-mermaid-responsive';
import rehypeMermaidResponsive from './src/plugins/rehype-mermaid-responsive';

const isDev = process.env.NODE_ENV === 'development';
const mermaidTheme = 'forest';
// Build-time Mermaid rendering (rehype-mermaid) runs in a headless environment,
// so fonts & spacing can differ from dev (browser). Lock these to reduce layout drift.
const mermaidConfig = {
  theme: mermaidTheme,
};

export default defineConfig({
  site: 'https://shuaibird.github.io',
  integrations: isDev
    ? [
        mermaid({
          theme: mermaidTheme,
          autoTheme: true,
        }),
      ]
    : [],
  markdown: {
    syntaxHighlight: {
      excludeLangs: ['mermaid'],
    },
    remarkPlugins: [remarkMermaidResponsive],
    rehypePlugins: isDev
      ? []
      : [
          rehypeMermaidResponsive,
          [
            rehypeMermaid,
            {
              mermaidConfig,
            },
          ],
          rehypeWrapMermaid,
        ],
    shikiConfig: {
      theme: themeTokyoNight,
      wrap: false,
    },
  },
});
