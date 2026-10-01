import { getLeaderboard, getWards } from '@/utils/api/wards';
import { buildDemoBoard, arenaZonesAsWards } from '@/data/tvk-arenas';
import HomeClient from './components/HomeClient';

export const revalidate = 60;

export default async function Home() {
  const [leaderboard, wards] = await Promise.all([
    getLeaderboard(),
    getWards(),
  ]);

  // Fall back to the pre-season arena board (real TVK zones + bosses)
  // until Supabase is seeded via supabase-seed-wards.sql.
  const board = leaderboard.length > 0 ? leaderboard : buildDemoBoard();
  const zoneList = wards.length > 0 ? wards : arenaZonesAsWards();

  return <HomeClient initialLeaderboard={board} initialWards={zoneList} isDemo={leaderboard.length === 0} />;
}
