import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GameType, PageEntryType } from '@/lib/definitions';
import { actions } from 'astro:actions';

interface GamesContextType {
  games: GameType[];
  isLoading: boolean;
  refetch: () => void;
  error: Error | null;
  pages: PageEntryType[];
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export function GamesProvider({
  initialGames,
  codePrefix,
  pages,
  children,
}: {
  initialGames: GameType[];
  codePrefix: string;
  pages: PageEntryType[];
  children: ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState(codePrefix);
  const { data, isLoading, error, refetch } = useQuery<GameType[]>({
    queryKey: ['games', currentPage],
    queryFn: async () => {
      console.log('fetching games', currentPage);

      const { data, error } = await actions.getGamesByCodePrefix({
        codePrefix: currentPage,
      });
      if (error) {
        console.log('Error fetching games', error);
      }
      console.log('fetched games', currentPage, data);
      return data;
    },
    refetchInterval: 5000, // Refetch every 30 seconds
    staleTime: 500, // Consider data stale after 10 seconds
    initialData: initialGames,
  });

  return (
    <GamesContext.Provider
      value={{
        games: data || [],
        isLoading,
        error: error as Error | null,
        refetch,
        pages,
        currentPage,
        setCurrentPage,
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
