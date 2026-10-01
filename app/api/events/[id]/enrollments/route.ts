import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import type { Profile } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('event_enrollments')
      .select('user_id')
      .eq('event_id', Number(id));

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
    }

    const userIds = (data ?? []).map((d) => d.user_id);
    if (userIds.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email')
      .in('id', userIds);

    if (profileError) {
      return NextResponse.json({ profiles: [] });
    }

    return NextResponse.json({ profiles: (profiles as Profile[]) ?? [] });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
