import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PickType } from '@/lib/definitions';

export function UserPicksTable({ picks }: { picks: PickType[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>W/L</TableHead>
          <TableHead>Matchup</TableHead>
          <TableHead>Prediction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {picks.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <span
                className={`text-sm font-bold ${
                  p.win_prediction.includes('I')
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {p.win_prediction.includes('I') ? 'W' : 'L'}
              </span>
            </TableCell>
            <TableCell className='font-medium'>
              <a href={`/matchups/${p.matchup}`}>{p.matchup}</a>
            </TableCell>
            <TableCell>{p.win_prediction}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
