import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [tailwind({ applyBaseStyles: true })],
  experimental: {
    serverIslands: true,
    env: {
      schema: {
        POCKETBASE_URL: envField.string({
          context: 'server',
          access: 'public',
        }),
      },
    },
  },
});
