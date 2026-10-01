import { getLeaderboard, getWards } from '@/utils/api/wards';
import HomeClient from './components/HomeClient';

export const revalidate = 60;

export default async function Home() {
  const [leaderboard, wards] = await Promise.all([
    getLeaderboard(),
    getWards(),
  ]);

  return <HomeClient initialLeaderboard={leaderboard} initialWards={wards} />;
}
