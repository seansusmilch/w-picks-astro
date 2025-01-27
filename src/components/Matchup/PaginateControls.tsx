import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { PageEntryType } from '@/lib/definitions';

export function PaginateControls({
  page,
  nextPage,
  prevPage,
  onNext,
  onPrev,
}: {
  page: PageEntryType;
  nextPage: PageEntryType;
  prevPage: PageEntryType;
  onNext?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onPrev?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Pagination>
      <PaginationContent className='w-full'>
        <div className='w-full grid grid-cols-3 justify-items-stretch'>
          <PaginationItem className='justify-self-start'>
            <PaginationPrevious href={prevPage.href} onClick={onPrev} />
          </PaginationItem>
          <PaginationItem className='justify-self-center inline-flex items-center'>
            {page.title}
          </PaginationItem>
          <PaginationItem className='justify-self-end'>
            <PaginationNext href={nextPage.href} onClick={onNext} />
          </PaginationItem>
        </div>
      </PaginationContent>
    </Pagination>
  );
}
