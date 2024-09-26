import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type PageEntry = {
  title: string;
  href: string;
};

export function PaginateControls({
  page,
  nextPage,
  prevPage,
}: {
  page: PageEntry;
  nextPage: PageEntry;
  prevPage: PageEntry;
}) {
  return (
    <Pagination>
      <PaginationContent className='w-full'>
        <div className='w-full grid grid-cols-3 justify-items-stretch'>
          <PaginationItem className='justify-self-start'>
            <PaginationPrevious href={prevPage.href} />
          </PaginationItem>
          <PaginationItem className='justify-self-center inline-flex items-center'>
            {page.title}
          </PaginationItem>
          <PaginationItem className='justify-self-end'>
            <PaginationNext href={nextPage.href} />
          </PaginationItem>
        </div>
      </PaginationContent>
    </Pagination>
  );
}
