import { PostHog } from 'posthog-node';
import { POSTHOG_API_HOST, POSTHOG_API_TOKEN } from 'astro:env/server';

let posthogClient = null;

export default function PostHogClient() {
  if (!posthogClient) {
    posthogClient = new PostHog(POSTHOG_API_TOKEN, {
      host: POSTHOG_API_HOST,
    });
  }
  return posthogClient;
}
