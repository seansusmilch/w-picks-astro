import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the public URL for a user's avatar from PocketBase
 * Uses POCKETBASE_PUBLIC_URL which should be accessible from the client
 */
export function getUserAvatarUrl(userId: string, filename: string): string | null {
  if (!filename || !userId) return null;
  const POCKETBASE_PUBLIC_URL = process.env.POCKETBASE_PUBLIC_URL || process.env.NEXT_PUBLIC_POCKETBASE_PUBLIC_URL;
  if (!POCKETBASE_PUBLIC_URL) {
    console.warn('POCKETBASE_PUBLIC_URL is not set, avatar URLs may not work correctly');
    return null;
  }
  return new URL(
    `/api/files/users/${userId}/${filename}`,
    POCKETBASE_PUBLIC_URL
  ).toString();
}

