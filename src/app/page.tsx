import { createClient } from '@/lib/supabase/server';
import type { LeaderboardEntry, ClusterType } from '@/lib/types';
import { CLUSTERS } from '@/lib/types';
import Header from '@/components/Header';
import CircuitBackground from '@/components/CircuitBackground';
import ClusterGrid from '@/components/ClusterGrid';

export const dynamic = 'force-dynamic';

async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  if (!supabase) {
    console.warn('Supabase client not initialized — check your env variables.');
    return [];
  }

  // Fetch leaderboard data
  const { data: leaderboard, error: lbError } = await supabase
    .from('leaderboard')
    .select('*')
    .order('tp', { ascending: false });

  if (lbError) {
    console.error('Error fetching leaderboard:', lbError);
    return [];
  }

  // Fetch profiles for photo URLs
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('name, photo_url');

  if (profError) {
    console.error('Error fetching profiles:', profError);
  }

  // Create a name -> photo_url map
  const photoMap = new Map<string, string | null>();
  (profiles || []).forEach((p) => {
    photoMap.set(p.name, p.photo_url);
  });

  // Join photo_url from profiles into leaderboard entries
  return (leaderboard || []).map((entry) => ({
    ...entry,
    photo_url: photoMap.get(entry.name) || null,
  }));
}

export default async function HomePage() {
  const data = await getLeaderboardData();

  // Get top rider from each cluster for the circuit overlay
  const topRiders = CLUSTERS.map((cluster) => {
    const entries = data.filter((e) => e.cluster === cluster);
    entries.sort((a, b) => b.tp - a.tp);
    return entries[0] ? { cluster: cluster as ClusterType, entry: entries[0] } : null;
  }).filter(Boolean) as { cluster: ClusterType; entry: LeaderboardEntry }[];

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative">
      <CircuitBackground topRiders={topRiders} />
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Title */}
        <div className="text-center mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ED1C24]/10 border border-[#ED1C24]/20 rounded-full mb-4">
            <div className="w-2 h-2 rounded-full bg-[#ED1C24] animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#ED1C24]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Live Standings
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            THE <span className="text-[#ED1C24]">GRID</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Performance standings across all racing classes. Click any rider to view their detailed analytics.
          </p>
        </div>

        {/* Data or Empty State */}
        {data.length > 0 ? (
          <ClusterGrid data={data} />
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] mb-4">
              <span className="text-4xl">🏁</span>
            </div>
            <h3
              className="text-lg font-bold text-gray-400 mb-2"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              NO DATA YET
            </h3>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              The leaderboard is empty. An admin needs to upload a CSV to populate the standings.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[#1a1a1a] text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#ED1C24] to-[#b91520] rounded-md flex items-center justify-center transform -skew-x-6">
              <span className="text-white text-[8px] font-black skew-x-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                AL
              </span>
            </div>
            <span className="text-xs text-gray-600">
              Astra Motor • Leaders League: Mandalika Edition
            </span>
          </div>
          <p className="text-[10px] text-gray-700">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </footer>
      </main>
    </div>
  );
}
