import { vi } from 'vitest';
import { z } from 'zod';

vi.mock('astro/zod', () => ({
  z,
}));

vi.mock('astro:env/client', () => ({
  POCKETBASE_PUBLIC_URL: 'http://localhost:8090',
}));

vi.mock('astro:env/server', () => ({
  POCKETBASE_URL: 'http://localhost:8090',
  ADMIN_USER: 'admin@test.com',
  ADMIN_PASSWORD: 'admin123',
  POSTHOG_API_HOST: 'http://localhost:3000',
  POSTHOG_API_TOKEN: 'test-token',
}));
