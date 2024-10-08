import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [tailwind({ applyBaseStyles: true }), react()],
  experimental: {
    serverIslands: true,
    env: {
      schema: {
        POCKETBASE_URL: envField.string({
          context: 'server',
          access: 'secret',
        }),
        POCKETBASE_PUBLIC_URL: envField.string({
          context: 'client',
          access: 'public',
        }),
        ADMIN_USER: envField.string({
          context: 'server',
          access: 'secret',
        }),
        ADMIN_PASSWORD: envField.string({
          context: 'server',
          access: 'secret',
        }),
      },
    },
  },
});
