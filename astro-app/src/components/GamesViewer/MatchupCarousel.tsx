/**
 * This takes a list of matchups and displays them in a carousel.
 */
import { Carousel, CarouselContent } from '@/components/ui/carousel';
import { useGames } from './GamesProvider';
import { GamesViewer } from './GamesViewer';

export function MatchupCarousel() {
  const { setCarouselApi, startIndex } = useGames();

  return (
    <Carousel opts={{ startIndex }} setApi={setCarouselApi}>
      <CarouselContent>
        <GamesViewer />
      </CarouselContent>
    </Carousel>
  );
}
