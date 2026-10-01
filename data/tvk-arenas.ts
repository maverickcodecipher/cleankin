/**
 * CleanKin Arena Data — Chennai Clean League
 * ---------------------------------------------------------------
 * SOURCES (public, verified Oct 2026):
 *  - TVK party-district structure: thamizhagavettrikazhagam.com/organization.php
 *    (13 Chennai party districts under Chennai revenue district)
 *  - District secretaries: TVK official announcements Mar 2025, consolidated
 *    public list (tnupdates.com/tvk-leadership-and-district-secretaries-list)
 *  - Constituency ↔ secretary cross-check: tvkvijay.com/en/election-candidates/tamilnadu
 *    (Ambattur→East, Thiru.Vi.Ka Nagar→North, Royapuram→South(South),
 *     Virugambakkam→South(West), Shozhinganallur→Suburban)
 *  - GCC zones/wards: Greater Chennai Corporation + chennai.nic.in
 *    (15 zones, 200 wards)
 *
 * NOTE: TVK party districts are organisational units, not GCC zones.
 * Zone ↔ party-district mapping below is CleanKin's editorial coverage map
 * (confirmed seats marked ✓, rest approximate). In-charge names are real;
 * zone assignment is best-effort. Run supabase-seed-wards.sql to persist.
 */

export interface TvkDistrict {
  id: string;
  name: string;
  secretary: string;
  confirmedSeat?: string;
}

export const TVK_DISTRICTS: TvkDistrict[] = [
  { id: 'north-north', name: 'Chennai North North', secretary: 'V. Siva' },
  { id: 'northeast', name: 'Chennai Northeast', secretary: 'G. Velu' },
  { id: 'northwest', name: 'Chennai Northwest', secretary: 'N. Thanigasalam' },
  { id: 'north-south', name: 'Chennai North South', secretary: 'K. Vijayaragavan' },
  { id: 'north', name: 'Chennai North', secretary: 'M.R. Pallavi', confirmedSeat: 'Thiru.Vi.Ka Nagar' },
  { id: 'central', name: 'Chennai Central', secretary: 'S.K.M. Kumar' },
  { id: 'central-south', name: 'Chennai Central South', secretary: 'R. Dilip Kumar' },
  { id: 'central-west', name: 'Chennai Central West', secretary: 'A.S. Palani' },
  { id: 'east', name: 'Chennai East', secretary: 'G. Balamurugan', confirmedSeat: 'Ambattur' },
  { id: 'south-north', name: 'Chennai South North', secretary: 'K. Appunu (Velmurugan)' },
  { id: 'south-south', name: 'Chennai South South', secretary: 'K. Vijay Dhamu', confirmedSeat: 'Royapuram' },
  { id: 'south-west', name: 'Chennai South West', secretary: 'R. Sabarinathan', confirmedSeat: 'Virugambakkam' },
  { id: 'suburban', name: 'Chennai Suburban', secretary: 'P. Saravanamoorthy', confirmedSeat: 'Shozhinganallur' },
];

export interface ArenaZone {
  zone: number;
  name: string;
  wardStart: number;
  wardEnd: number;
  wardsLabel: string;
  hq: string;
  tvkDistrictId: string;
}

export const ARENA_ZONES: ArenaZone[] = [
  { zone: 1, name: 'Thiruvottiyur', wardStart: 1, wardEnd: 14, wardsLabel: 'Wards 1–14', hq: 'Thiruvottiyur', tvkDistrictId: 'north-north' },
  { zone: 2, name: 'Manali', wardStart: 15, wardEnd: 21, wardsLabel: 'Wards 15–21', hq: 'Manali', tvkDistrictId: 'northeast' },
  { zone: 3, name: 'Madhavaram', wardStart: 22, wardEnd: 33, wardsLabel: 'Wards 22–33', hq: 'Madhavaram', tvkDistrictId: 'northwest' },
  { zone: 4, name: 'Tondiarpet', wardStart: 34, wardEnd: 48, wardsLabel: 'Wards 34–48', hq: 'Tondiarpet', tvkDistrictId: 'north-south' },
  { zone: 5, name: 'Royapuram', wardStart: 49, wardEnd: 63, wardsLabel: 'Wards 49–63', hq: 'Royapuram', tvkDistrictId: 'south-south' },
  { zone: 6, name: 'Thiru-Vi-Ka Nagar', wardStart: 64, wardEnd: 78, wardsLabel: 'Wards 64–78', hq: 'Perambur', tvkDistrictId: 'north' },
  { zone: 7, name: 'Ambattur', wardStart: 79, wardEnd: 93, wardsLabel: 'Wards 79–93', hq: 'Ambattur', tvkDistrictId: 'east' },
  { zone: 8, name: 'Anna Nagar', wardStart: 94, wardEnd: 108, wardsLabel: 'Wards 94–108', hq: 'Anna Nagar', tvkDistrictId: 'central' },
  { zone: 9, name: 'Teynampet', wardStart: 109, wardEnd: 126, wardsLabel: 'Wards 109–126', hq: 'Teynampet', tvkDistrictId: 'central-south' },
  { zone: 10, name: 'Kodambakkam', wardStart: 127, wardEnd: 142, wardsLabel: 'Wards 127–142', hq: 'Kodambakkam', tvkDistrictId: 'south-west' },
  { zone: 11, name: 'Valasaravakkam', wardStart: 143, wardEnd: 155, wardsLabel: 'Wards 143–155', hq: 'Valasaravakkam', tvkDistrictId: 'central-west' },
  { zone: 12, name: 'Alandur', wardStart: 156, wardEnd: 167, wardsLabel: 'Wards 156–167', hq: 'Alandur', tvkDistrictId: 'south-north' },
  { zone: 13, name: 'Adyar', wardStart: 170, wardEnd: 182, wardsLabel: 'Wards 170–182', hq: 'Adyar', tvkDistrictId: 'suburban' },
  { zone: 14, name: 'Perungudi', wardStart: 183, wardEnd: 191, wardsLabel: 'Wards 168–169, 183–191', hq: 'Perungudi', tvkDistrictId: 'suburban' },
  { zone: 15, name: 'Sholinganallur', wardStart: 192, wardEnd: 200, wardsLabel: 'Wards 192–200', hq: 'Sholinganallur', tvkDistrictId: 'suburban' },
];

export function tvkOfZone(zone: number): TvkDistrict {
  const z = ARENA_ZONES.find(a => a.zone === zone);
  return TVK_DISTRICTS.find(t => t.id === z?.tvkDistrictId) ?? TVK_DISTRICTS[0];
}

/** Rank tiers for the gamified board. */
export function rankTier(score: number): { title: string; color: string; glow: string } {
  if (score >= 90) return { title: 'LEGEND', color: '#35F27C', glow: '0 0 24px rgba(53,242,124,0.45)' };
  if (score >= 75) return { title: 'CHAMPION', color: '#A3E635', glow: '0 0 18px rgba(163,230,53,0.35)' };
  if (score >= 60) return { title: 'CONTENDER', color: '#FBBF24', glow: '0 0 14px rgba(251,191,36,0.3)' };
  return { title: 'ROOKIE', color: '#FF5470', glow: '0 0 14px rgba(255,84,112,0.3)' };
}

/**
 * Deterministic pre-season demo board (used only when Supabase is empty).
 * Scores are stable per zone so the league looks alive before real data lands.
 */
export function buildDemoBoard(): import('@/types/database').WardLeaderboardEntry[] {
  const rows = ARENA_ZONES.map(z => {
    const ward_id = 1000 + z.zone;
    const cleanliness_score = 62 + ((z.zone * 37 + 11) % 36);
    const active_reports = (z.zone * 13 + 5) % 18;
    const resolved_reports = 20 + ((z.zone * 29 + 7) % 60);
    const tvk = tvkOfZone(z.zone);
    return {
      ward_id,
      ward_number: z.wardStart,
      zone_number: z.zone,
      zone_name: `Zone ${z.zone} · ${z.name}`,
      locality_name: z.hq,
      incharge_name: tvk.secretary,
      incharge_party: `TVK · ${tvk.name}`,
      active_reports,
      resolved_reports,
      cleanliness_score,
      __demo: true,
    } as import('@/types/database').WardLeaderboardEntry & { __demo?: boolean };
  });
  return (rows as unknown as import('@/types/database').WardLeaderboardEntry[]).sort(
    (a, b) => b.cleanliness_score - a.cleanliness_score || a.active_reports - b.active_reports
  );
}

/** Zone list shaped as Wards for selects when Supabase is empty. */
export function arenaZonesAsWards(): import('@/types/database').Ward[] {
  return ARENA_ZONES.map(z => {
    const tvk = tvkOfZone(z.zone);
    return {
      id: 1000 + z.zone,
      ward_number: z.wardStart,
      zone_number: z.zone,
      zone_name: `Zone ${z.zone} · ${z.name}`,
      locality_name: `${z.hq} (${z.wardsLabel})`,
      incharge_name: tvk.secretary,
      incharge_party: `TVK · ${tvk.name}`,
      created_at: new Date().toISOString(),
    };
  });
}
