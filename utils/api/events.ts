import { createSupabaseServerClient } from '@/utils/supabase/server';
import type { CleanupEvent, EventEnrollment, Profile, Ward } from '@/types/database';

export async function getEvents(): Promise<CleanupEvent[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('cleanup_events')
      .select('*')
      .eq('status', 'scheduled')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Failed to fetch events:', error.message);
      return [];
    }

    return (data as CleanupEvent[]) ?? [];
  } catch (err) {
    console.error('Error fetching events:', err);
    return [];
  }
}

export async function createEvent(data: {
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  meeting_point: string | null;
  ward_id: number | null;
  report_id: number | null;
  organizer_id: string;
}): Promise<CleanupEvent | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: result, error } = await supabase
      .from('cleanup_events')
      .insert([{
        title: data.title,
        description: data.description,
        event_date: data.event_date,
        event_time: data.event_time,
        meeting_point: data.meeting_point,
        ward_id: data.ward_id,
        report_id: data.report_id,
        organizer_id: data.organizer_id,
        status: 'scheduled' as const,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create event:', error.message);
      return null;
    }

    return result as CleanupEvent;
  } catch (err) {
    console.error('Error creating event:', err);
    return null;
  }
}

export async function updateEventStatus(
  id: number,
  status: string,
  cancellationReason: string | null,
  organizerId: string
): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: eventData, error: fetchError } = await supabase
      .from('cleanup_events')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (fetchError || !eventData || eventData.organizer_id !== organizerId) {
      return false;
    }

    const { error } = await supabase
      .from('cleanup_events')
      .update({
        status: status as CleanupEvent['status'],
        cancellation_reason: cancellationReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to update event:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error updating event:', err);
    return false;
  }
}

export async function enrollInEvent(eventId: number, userId: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('event_enrollments')
      .insert([{ event_id: eventId, user_id: userId }]);

    if (error) {
      console.error('Failed to enroll:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error enrolling:', err);
    return false;
  }
}

export async function unenrollFromEvent(eventId: number, userId: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('event_enrollments')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to unenroll:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error unenrolling:', err);
    return false;
  }
}

export async function getEventEnrollments(eventId: number): Promise<Profile[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('event_enrollments')
      .select('user_id')
      .eq('event_id', eventId);

    if (error || !data || data.length === 0) return [];

    const userIds = data.map((d) => d.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email')
      .in('id', userIds);

    if (profileError) return [];
    return (profiles as Profile[]) ?? [];
  } catch (err) {
    console.error('Error fetching enrollments:', err);
    return [];
  }
}

export async function getOrganizerProfile(organizerId: string): Promise<Profile | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email')
      .eq('id', organizerId)
      .single();

    if (error) return null;
    return (data as Profile) ?? null;
  } catch (err) {
    console.error('Error fetching organizer profile:', err);
    return null;
  }
}
