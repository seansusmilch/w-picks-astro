import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export function LeaderboardSkeleton() {
  return (
    <div className="w-full -mx-3 sm:mx-0">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="px-3 py-2 text-left">
              <div className="h-3 w-6 bg-muted rounded animate-pulse" />
            </TableHead>
            <TableHead className="px-3 py-2 text-left">
              <div className="h-3 w-12 bg-muted rounded animate-pulse" />
            </TableHead>
            <TableHead className="px-3 py-2 text-right">
              <div className="h-3 w-10 bg-muted rounded animate-pulse ml-auto" />
            </TableHead>
            <TableHead className="px-3 py-2 text-right">
              <div className="h-3 w-10 bg-muted rounded animate-pulse ml-auto" />
            </TableHead>
            <TableHead className="hidden md:table-cell px-3 py-2 text-right">
              <div className="h-3 w-10 bg-muted rounded animate-pulse ml-auto" />
            </TableHead>
            <TableHead className="px-3 py-2 text-right">
              <div className="h-3 w-12 bg-muted rounded animate-pulse ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 15 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="px-3 py-2">
                <div className="h-5 w-8 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
              </TableCell>
              <TableCell className="px-3 py-2 text-right">
                <div className="h-4 w-8 bg-muted rounded animate-pulse ml-auto" />
              </TableCell>
              <TableCell className="px-3 py-2 text-right">
                <div className="h-4 w-8 bg-muted rounded animate-pulse ml-auto" />
              </TableCell>
              <TableCell className="hidden md:table-cell px-3 py-2 text-right">
                <div className="h-4 w-10 bg-muted rounded animate-pulse ml-auto" />
              </TableCell>
              <TableCell className="px-3 py-2 text-right">
                <div className="h-4 w-10 bg-muted rounded animate-pulse ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


