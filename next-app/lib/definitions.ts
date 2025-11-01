import { z } from 'zod';

export const BaseZ = z.object({
  id: z.string().length(15),
  created: z.string(),
  updated: z.string(),
});

export const UserSettingsZ = z.object({
  colorfulPicks: z.boolean().default(true),
  hideFromLatestPicks: z.boolean().default(false),
});

export type UserSettingsType = z.infer<typeof UserSettingsZ>;

export const UserZ = BaseZ.extend({
  email: z.string().email(),
  username: z.string(),
  avatar: z.string(),
  bio: z.string(),
  avatar_url: z.string().url().optional(),
  settings: UserSettingsZ.nullable().default(UserSettingsZ.parse({})),
});

export type UserType = z.infer<typeof UserZ>;

export const StatZ = z.object({
  user: z.string().length(15),
  total_picks: z.number().min(0),
  win_picks: z.number().min(0),
  lose_picks: z.number().min(0),
  win_loss_ratio: z.number().min(0).or(z.null()),
  win_pick_rate: z.number().min(0).max(100).or(z.null()),
});

export type StatType = z.infer<typeof StatZ>;
