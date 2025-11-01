'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GameType, PageEntryType } from '@/lib/definitions';
import { getGamesByCodePrefix } from '@/actions';
import type { CarouselApi } from '@/components/ui/carousel';
import { queryClient } from '@/stores/query';
import { useStore } from '@nanostores/react';

interface GamesContextType {
  games: GameType[];
  isLoading: boolean;
  error: Error | null;
  pages: PageEntryType[];
  currentPage: string;
  setCurrentPage: (page: string) => void;
  userId: string;
  carouselApi: CarouselApi | undefined;
  setCarouselApi: (api: CarouselApi) => void;
  startIndex: number;
  selectedGameIndex: number;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export function GamesProvider({
  codePrefix,
  pages,
  children,
  userId,
}: {
  codePrefix: string;
  pages: PageEntryType[];
  children: ReactNode;
  userId: string;
}) {
  const [currentPage, setCurrentPage] = useState(codePrefix);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [startIndex, setStartIndex] = useState(0);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const client = useStore(queryClient);

  const { data, isLoading, error } = useQuery<GameType[]>(
    {
      queryKey: ['games', currentPage],
      queryFn: async () => {
        try {
          const data = await getGamesByCodePrefix({
            codePrefix: currentPage,
          });
          return data;
        } catch (err: any) {
          throw new Error(err.message || 'Failed to fetch games');
        }
      },
      refetchInterval: 2500,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
    },
    client
  );

  // Handle URL state
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    // Set initial page param if not present
    if (!params.get('page')) {
      params.set('page', codePrefix);
      window.history.replaceState(null, '', `?${params.toString()}`);
    }

    // Handle initial game selection
    const pageParam = params.get('page');
    const gameParam = params.get('game');
    if (pageParam && gameParam && data) {
      const matchupCode = `${pageParam}/${gameParam}`;
      const idx = data.findIndex((game) => game.matchup.code === matchupCode);
      if (idx !== -1) setStartIndex(idx);
    }
  }, [codePrefix, data]);

  // Handle carousel navigation
  useEffect(() => {
    if (!carouselApi || !data) return;

    carouselApi.on('select', (e) => {
      const idx = e.selectedScrollSnap();
      setSelectedGameIndex(idx);
      const selectedGame = data[idx];

      if (selectedGame) {
        const url = new URL(window.location.href);
        url.searchParams.set('game', selectedGame.matchup.code.split('/')[1]);
        window.history.pushState({}, '', url);
      }
    });
  }, [carouselApi, data]);

  const handlePageChange = (newPage: string) => {
    setCurrentPage(newPage);
    const url = new URL(window.location.href);
    url.searchParams.set('page', newPage);
    window.history.pushState({}, '', url);
  };

  return (
    <GamesContext.Provider
      value={{
        games: data || [],
        isLoading,
        error: error as Error | null,
        pages,
        currentPage,
        setCurrentPage: handlePageChange,
        userId,
        carouselApi,
        setCarouselApi,
        startIndex,
        selectedGameIndex,
      }}
    >
      {children}
    </GamesContext.Provider>
  );
}

// Custom hook to use the games context
export function useGames() {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
}
