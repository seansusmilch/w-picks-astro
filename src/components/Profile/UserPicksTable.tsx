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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PickType } from '@/lib/definitions';

export function UserPicksTable({
  picks,
  defaultTab,
}: {
  picks: PickType[];
  defaultTab: 'past' | 'live' | 'upcoming';
}) {
  const pastPicks = picks.filter((p) => p.status === 'past');
  const livePicks = picks.filter((p) => p.status === 'live');
  const upcomingPicks = picks.filter((p) => p.status === 'upcoming');

  return (
    <Tabs defaultValue={defaultTab}>
      <div className='flex justify-center'>
        <TabsList>
          <TabsTrigger value='past'>Past</TabsTrigger>
          <TabsTrigger value='live'>Live</TabsTrigger>
          <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value='live'>
        <LivePicksTable picks={livePicks} />
      </TabsContent>
      <TabsContent value='upcoming'>
        <UpcomingPicksTable picks={upcomingPicks} />
      </TabsContent>
      <TabsContent value='past'>
        <PastPicksTable picks={pastPicks} />
      </TabsContent>
    </Tabs>
  );
}

function PastPicksTable({ picks }: { picks: PickType[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>W/L</TableHead>
          <TableHead>Matchup</TableHead>
          <TableHead>Prediction</TableHead>
          <TableHead>User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {picks.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <span
                className={`text-sm font-bold ${
                  p.result === 'W' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {p.result}
              </span>
            </TableCell>
            <TableCell className='font-medium'>
              <a href={`/matchups/${p.matchup}`}>{p.matchup}</a>
            </TableCell>
            <TableCell>{p.win_prediction}</TableCell>
            <TableCell>{p.user}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LivePicksTable({ picks }: { picks: PickType[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Matchup</TableHead>
          <TableHead>Prediction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {picks.map((p) => (
          <TableRow key={p.id}>
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

function UpcomingPicksTable({ picks }: { picks: PickType[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Matchup</TableHead>
          <TableHead>Prediction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {picks.map((p) => (
          <TableRow key={p.id}>
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
