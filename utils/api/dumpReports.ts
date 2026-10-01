import { createSupabaseServerClient } from '@/utils/supabase/server';
import type { DumpReport, DumpReportStatus } from '@/types/database';

export async function submitDumpReport(data: {
  ward_id: number;
  latitude: number;
  longitude: number;
  image_url: string | null;
  description: string | null;
  user_id: string;
}): Promise<DumpReport | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: result, error } = await supabase
      .from('dump_reports')
      .insert([{
        ward_id: data.ward_id,
        user_id: data.user_id,
        latitude: data.latitude,
        longitude: data.longitude,
        image_url: data.image_url,
        description: data.description,
        status: 'active' as DumpReportStatus,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to submit dump report:', error.message);
      return null;
    }

    return result as DumpReport;
  } catch (err) {
    console.error('Error submitting dump report:', err);
    return null;
  }
}

export async function getMyReports(userId: string): Promise<DumpReport[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('dump_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch my reports:', error.message);
      return [];
    }

    return (data as DumpReport[]) ?? [];
  } catch (err) {
    console.error('Error fetching my reports:', err);
    return [];
  }
}

export async function updateDumpReportStatus(
  reportId: number,
  status: DumpReportStatus,
  cancellationReason: string | null
): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('dump_reports')
      .update({
        status,
        cancellation_reason: cancellationReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) {
      console.error('Failed to update dump report:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error updating dump report:', err);
    return false;
  }
}
