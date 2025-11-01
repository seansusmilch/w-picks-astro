import { PostHog } from 'posthog-node';

const POSTHOG_API_HOST = process.env.POSTHOG_API_HOST || '';
const POSTHOG_API_TOKEN = process.env.POSTHOG_API_TOKEN || '';

let posthogClient: PostHog | null = null;

export function PostHogClient() {
  if (!posthogClient && POSTHOG_API_TOKEN) {
    posthogClient = new PostHog(POSTHOG_API_TOKEN, {
      host: POSTHOG_API_HOST,
    });
  }
  return posthogClient;
}

export async function isFeatureEnabled(feature: string, distinctId: string) {
  const posthogClient = PostHogClient();
  if (!posthogClient) {
    return false;
  }
  return await posthogClient.isFeatureEnabled(feature, distinctId);
}
