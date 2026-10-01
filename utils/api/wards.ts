import { createSupabaseServerClient } from '@/utils/supabase/server';
import type { Ward, DumpReport, CleanupEvent, WardLeaderboardEntry } from '@/types/database';

export async function getLeaderboard(): Promise<WardLeaderboardEntry[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('ward_leaderboard')
      .select('*')
      .order('cleanliness_score', { ascending: false })
      .order('active_reports', { ascending: true })
      .order('ward_number', { ascending: true });

    if (error) {
      console.error('Failed to fetch leaderboard:', error.message);
      return [];
    }

    return (data as WardLeaderboardEntry[]) ?? [];
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

export async function getWards(): Promise<Ward[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('wards')
      .select('*')
      .order('ward_number', { ascending: true });

    if (error) {
      console.error('Failed to fetch wards:', error.message);
      return [];
    }

    return (data as Ward[]) ?? [];
  } catch (err) {
    console.error('Error fetching wards:', err);
    return [];
  }
}

export async function getWardDetails(wardId: number): Promise<{
  ward: Ward | null;
  activeReports: DumpReport[];
  upcomingEvents: CleanupEvent[];
} | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: wardData, error: wardError } = await supabase
      .from('wards')
      .select('*')
      .eq('id', wardId)
      .single();

    if (wardError) {
      console.error('Failed to fetch ward:', wardError.message);
      return null;
    }

    const { data: reportsData, error: reportsError } = await supabase
      .from('dump_reports')
      .select('*')
      .eq('ward_id', wardId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (reportsError) {
      console.error('Failed to fetch active reports:', reportsError.message);
    }

    const { data: eventsData, error: eventsError } = await supabase
      .from('cleanup_events')
      .select('*')
      .eq('ward_id', wardId)
      .in('status', ['scheduled'])
      .order('event_date', { ascending: true });

    if (eventsError) {
      console.error('Failed to fetch upcoming events:', eventsError.message);
    }

    return {
      ward: wardData as Ward | null,
      activeReports: (reportsData as DumpReport[]) ?? [],
      upcomingEvents: (eventsData as CleanupEvent[]) ?? [],
    };
  } catch (err) {
    console.error('Error fetching ward details:', err);
    return null;
  }
}
