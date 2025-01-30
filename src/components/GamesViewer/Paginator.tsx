import { useGames } from './GamesProvider';
import { PaginateControls } from '../Matchup/PaginateControls';

export function Paginator() {
  const { pages, currentPage, setCurrentPage } = useGames();

  const pageIndex = pages.findIndex(
    (p) => p.date_code === parseInt(currentPage)
  );
  if (pageIndex === -1) return null;

  const page = pages[pageIndex];
  const nextPage = pages[pageIndex + 1];
  const prevPage = pages[pageIndex - 1];

  if (!page) return null;

  const handleNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (nextPage) setCurrentPage(nextPage.date_code.toString());
  };

  const handlePrev = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (prevPage) setCurrentPage(prevPage.date_code.toString());
  };

  return (
    <PaginateControls
      page={page}
      nextPage={nextPage}
      prevPage={prevPage}
      onNext={handleNext}
      onPrev={handlePrev}
    />
  );
}
