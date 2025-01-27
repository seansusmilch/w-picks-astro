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
        throw new Error(error.message);
      }
      return data;
    },
    refetchInterval: 2500,
    staleTime: 30 * 1000, // Data stays fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep inactive data in cache for 5 minutes
    refetchOnWindowFocus: true,
  });

  // Create a wrapper for setCurrentPage that also triggers a refetch
  const handlePageChange = (newPage: string) => {
    setCurrentPage(newPage);
  };

  return (
    <GamesContext.Provider
      value={{
        games: data || [],
        isLoading,
        error: error as Error | null,
        refetch,
        pages,
        currentPage,
        setCurrentPage: handlePageChange,
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
