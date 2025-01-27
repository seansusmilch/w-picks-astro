import { PostHog } from 'posthog-node';
import { POSTHOG_API_HOST, POSTHOG_API_TOKEN } from 'astro:env/server';
import type { AstroCookies } from 'astro';

let posthogClient = null;

export function PostHogClient() {
  if (!posthogClient) {
    posthogClient = new PostHog(POSTHOG_API_TOKEN, {
      host: POSTHOG_API_HOST,
    });
  }
  return posthogClient;
}

export async function isFeatureEnabled(feature: string, distinctId: string) {
  const posthogClient = PostHogClient();
  return await posthogClient.isFeatureEnabled(feature, distinctId);
}
