'use client';

import { useState } from 'react';
import { Trash2, Sprout, Users, CalendarCheck, Recycle, ChevronsLeftRight } from 'lucide-react';

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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="relative h-56 select-none">
        {/* Before layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600 flex flex-col items-center justify-center text-white/90">
          <Trash2 className="w-12 h-12 mb-2 opacity-80" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Before</span>
        </div>
        {/* After layer, clipped by slider */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-[#0D5C75] flex flex-col items-center justify-center text-white"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        >
          <Sprout className="w-12 h-12 mb-2" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">After</span>
        </div>
        {/* Divider handle */}
        <div className="absolute inset-y-0 flex items-center" style={{ left: `calc(${pos}% - 18px)` }}>
          <div className="w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center">
            <ChevronsLeftRight className="w-5 h-5 text-slate-700" />
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
        <p className="text-[11px] font-black uppercase tracking-widest text-[#0D5C75] mb-1">{story.locality}</p>
        <h3 className="text-lg font-extrabold text-slate-900 mb-2">{story.title}</h3>
        <p className="text-slate-600 font-medium text-sm mb-4">{story.result}</p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-black border border-emerald-100">
            {story.waste} diverted
          </span>
          <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-black border border-slate-200">
            {story.volunteers} volunteers
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
    { icon: Recycle, value: `${cleanedCount}`, label: 'Spots Cleaned' },
    { icon: CalendarCheck, value: `${drivesCount}`, label: 'Drives Completed' },
    { icon: Users, value: volunteerCount > 0 ? `${volunteerCount}+` : '0', label: 'Active Volunteers' },
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
        <div className="text-center bg-white rounded-3xl border-2 border-dashed border-teal-200 px-8 py-14 mb-8">
          <Sprout className="w-12 h-12 mx-auto mb-4 text-[#0D5C75]" />
          <p className="text-xl font-extrabold text-slate-800">
            0 kg diverted · Ready for your first drive
          </p>
          <p className="text-slate-500 font-medium mt-2">
            Report a spot or organize a drive — cleaned sites will shine here.
          </p>
        </div>
      )}
      <div className="grid sm:grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-[#0D5C75] text-white rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="bg-white/15 p-3 rounded-2xl">
              <m.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-black">{m.value}</p>
              <p className="text-xs font-black uppercase tracking-widest text-white/70">{m.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
