import { useGames } from './GamesProvider';
import { PaginateControls } from '../Matchup/PaginateControls';

export function Paginator() {
  const { pages, currentPage, setCurrentPage } = useGames();

  const page = pages.find((p) => p.date_code === parseInt(currentPage));
  const nextPage = pages[pages.indexOf(page) + 1];
  const prevPage = pages[pages.indexOf(page) - 1];

  if (!page || !nextPage || !prevPage) return null;

  const handleNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set('page', nextPage.date_code.toString());
    window.history.pushState({}, '', url);
    setCurrentPage(nextPage.date_code.toString());
  };

  const handlePrev = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set('page', prevPage.date_code.toString());
    window.history.pushState({}, '', url);
    setCurrentPage(prevPage.date_code.toString());
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
