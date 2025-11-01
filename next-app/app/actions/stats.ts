'use server';

import { getAllStats, getWeeklyStats, getWeekList } from '@/lib/stats';
import { WeeklyStatZ } from '@/lib/definitions';

export async function getAllStatsAction() {
  try {
    const stats = await getAllStats();
    return { data: stats, error: null };
  } catch (error) {
    console.error('Failed to fetch all stats', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    };
  }
}

export async function getWeeklyStatsAction(week: string) {
  try {
    // Validate week format
    if (!WeeklyStatZ.shape.year_week.safeParse(week).success) {
      return {
        data: null,
        error: 'Invalid week format. Expected format: YYYY-WWW',
      };
    }

    const stats = await getWeeklyStats(week);
    return { data: stats, error: null };
  } catch (error) {
    console.error('Failed to fetch weekly stats', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch weekly stats',
    };
  }
}

export async function getWeekListAction() {
  try {
    const weekList = await getWeekList();
    return { data: weekList, error: null };
  } catch (error) {
    console.error('Failed to fetch week list', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch week list',
    };
  }
}

