import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export function PaginateControls({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  return (
    <Pagination>
      <PaginationContent className='w-full flex justify-between'>
        <PaginationItem>
          <PaginationPrevious
            href={`/matchups?page=${page > 1 ? page - 1 : 1}`}
          />
        </PaginationItem>
        <PaginationItem>
          {page}/{totalPages}
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={`/matchups?page=${page < totalPages ? page + 1 : totalPages}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
