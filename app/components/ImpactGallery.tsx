'use client';

import { useState } from 'react';
import { Trash2, Sprout, Users, CalendarCheck, Recycle, ChevronsLeftRight, Trophy } from 'lucide-react';

type Story = {
  id: string;
  title: string;
  locality: string;
  result: string;
  volunteers: number;
  waste: string;
};

const STORIES: Story[] = [
  {
    id: 'besant-canal',
    title: 'Besant Nagar Canal Stretch',
    locality: 'Besant Nagar',
    result: '180 kg plastic cleared by 32 volunteers.',
    volunteers: 32,
    waste: '180 kg plastic',
  },
  {
    id: 'triplicane-mrts',
    title: 'Triplicane MRTS Underpass',
    locality: 'Triplicane',
    result: 'Debris cleared & native saplings planted.',
    volunteers: 26,
    waste: '2.1 tons debris',
  },
  {
    id: 'cooum-chintadripet',
    title: 'Cooum Canal Bank Cleanup',
    locality: 'Chintadripet',
    result: '240 kg debris cleared by 28 volunteers.',
    volunteers: 28,
    waste: '240 kg debris',
  },
];

function BeforeAfterCard({ story }: { story: Story }) {
  const [pos, setPos] = useState(50);

  return (
    <div className="ck-card-3d bg-[#0B100D] rounded-3xl border border-[#1D2B23] hover:border-[#35F27C]/40 overflow-hidden flex flex-col transition-all">
      <div className="relative h-56 select-none">
        {/* Before layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2A1216] via-[#3A1A20] to-[#1A0B0E] flex flex-col items-center justify-center text-[#FF8FA3]/90">
          <Trash2 className="w-12 h-12 mb-2 opacity-80" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Before · Boss level dump</span>
        </div>
        {/* After layer, clipped by slider */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#35F27C] via-[#15803D] to-[#04120A] flex flex-col items-center justify-center text-[#04120A]"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        >
          <Sprout className="w-12 h-12 mb-2" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">After · Cleared</span>
        </div>
        {/* Divider handle */}
        <div className="absolute inset-y-0 flex items-center" style={{ left: `calc(${pos}% - 18px)` }}>
          <div className="w-9 h-9 rounded-full bg-[#35F27C] shadow-[0_0_18px_rgba(53,242,124,0.7)] flex items-center justify-center">
            <ChevronsLeftRight className="w-5 h-5 text-[#04120A]" />
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={e => setPos(Number(e.target.value))}
          aria-label={`Compare before and after for ${story.title}`}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
      <div className="p-6 flex-grow">
        <p className="text-[11px] font-black uppercase tracking-widest text-[#35F27C] mb-1">{story.locality}</p>
        <h3 className="text-lg font-black text-white mb-2">{story.title}</h3>
        <p className="text-[#93A89A] font-medium text-sm mb-4">{story.result}</p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-[#35F27C]/10 text-[#35F27C] px-3 py-1 rounded-full text-xs font-black border border-[#35F27C]/30">
            {story.waste} diverted
          </span>
          <span className="bg-white/5 text-[#93A89A] px-3 py-1 rounded-full text-xs font-black border border-[#1D2B23]">
            {story.volunteers} players
          </span>
        </div>
      </div>
    </div>
  );
}

type Props = {
  cleanedCount?: number;
  drivesCount?: number;
  volunteerCount?: number;
};

export default function ImpactGallery({ cleanedCount = 0, drivesCount = 0, volunteerCount = 0 }: Props) {
  const metrics = [
    { icon: Recycle, value: `${cleanedCount}`, label: 'Bosses Beaten' },
    { icon: CalendarCheck, value: `${drivesCount}`, label: 'Raids Completed' },
    { icon: Users, value: volunteerCount > 0 ? `${volunteerCount}+` : '0', label: 'Arena Players' },
  ];

  return (
    <div>
      {cleanedCount > 0 ? (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {STORIES.map(s => (
            <BeforeAfterCard key={s.id} story={s} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-[#0B100D] rounded-3xl border-2 border-dashed border-[#35F27C]/30 px-8 py-14 mb-8">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-[#35F27C]" />
          <p className="text-xl font-black text-white">
            Trophy cabinet empty · Ready for your first raid
          </p>
          <p className="text-[#93A89A] font-medium mt-2">
            Report a dump or start a raid — cleared sites will shine here.
          </p>
        </div>
      )}
      <div className="grid sm:grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-gradient-to-br from-[#35F27C] to-[#15803D] text-[#04120A] rounded-3xl p-6 flex items-center gap-4 shadow-[0_0_35px_rgba(53,242,124,0.25)]">
            <div className="bg-black/15 p-3 rounded-2xl">
              <m.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-black">{m.value}</p>
              <p className="text-xs font-black uppercase tracking-widest opacity-70">{m.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
