/**
 * This takes a list of matchups and displays them in a carousel.
 */
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useGames } from './GamesProvider';
import { GamesViewer } from './GamesViewer';
import { useState, useEffect } from 'react';

export function MatchupCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [startIndex, setStartIndex] = useState(0);
  const { games } = useGames();

  useEffect(() => {
    if (!api) return;

    const url = new URL(window.location.href);
    const pageParam = url.searchParams.get('page');
    const gameParam = url.searchParams.get('game');

    if (pageParam && gameParam) {
      const matchupCode = `${pageParam}/${gameParam}`;
      const idx = games.findIndex((game) => game.matchup.code === matchupCode);
      setStartIndex(idx);
    }

    api.on('select', (e) => {
      const idx = e.selectedScrollSnap();
      const selectedGame = games[idx];
      console.log(selectedGame, games);

      // Update the URL search params
      if (selectedGame) {
        const url = new URL(window.location.href);
        url.searchParams.set('game', selectedGame.matchup.code.split('/')[1]);
        window.history.pushState({}, '', url);
      }
    });
  }, [api, games]);

  return (
    <Carousel opts={{ startIndex }} setApi={setApi}>
      <CarouselContent>
        <GamesViewer />
      </CarouselContent>
    </Carousel>
  );
}
