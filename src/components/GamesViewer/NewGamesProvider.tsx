import type { GameType, PageEntryType } from '@/lib/definitions';
import {
  currentPageStore,
  gamesStore,
  pagesStore,
  userIdStore,
} from '@/stores/games';
import { queryClient } from '@/stores/query';
import { useQuery } from '@tanstack/react-query';
import { actions } from 'astro:actions';
import { useStore } from '@nanostores/react';

export function NewGamesProvider({
  page,
  games,
  pages,
  userId,
}: {
  page: string;
  games: GameType[];
  pages: PageEntryType[];
  userId: string;
}) {
  gamesStore.set(games);
  pagesStore.set(pages);
  userIdStore.set(userId);
  currentPageStore.set(page);

  const currentPage = useStore(currentPageStore);
  const client = useStore(queryClient);

  const { data } = useQuery<GameType[]>(
    {
      queryKey: ['games'],
      queryFn: async () => {
        const { data, error } = await actions.getGamesByCodePrefix({
          codePrefix: currentPage,
        });
        if (error) throw new Error(error.message);
        return data;
      },
      refetchInterval: 2500,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      initialData: games,
    },
    client
  );

  return <></>;
}
