export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Ward {
  id: number;
  ward_number: number;
  zone_number: number;
  zone_name: string;
  locality_name: string;
  incharge_name: string | null;
  incharge_party: string | null;
  created_at: string;
}

export type DumpReportStatus = 'active' | 'resolved' | 'cancelled';

export interface DumpReport {
  id: number;
  ward_id: number;
  user_id: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  description: string | null;
  status: DumpReportStatus;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type CleanupEventStatus = 'scheduled' | 'completed' | 'cancelled';

export interface CleanupEvent {
  id: number;
  report_id: number | null;
  organizer_id: string;
  ward_id: number | null;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  meeting_point: string | null;
  status: CleanupEventStatus;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventEnrollment {
  id: number;
  event_id: number;
  user_id: string;
  enrolled_at: string;
}

export interface WardLeaderboardEntry {
  ward_id: number;
  ward_number: number;
  zone_number: number;
  zone_name: string;
  locality_name: string;
  incharge_name: string | null;
  incharge_party: string | null;
  active_reports: number;
  resolved_reports: number;
  cleanliness_score: number;
}
