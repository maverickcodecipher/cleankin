'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import type { DumpReport, DumpReportStatus } from '@/types/database';

interface MyReportsModalProps {
  open: boolean;
  onClose: () => void;
}

const REASON_OPTIONS = [
  'Cleared by Municipal Corporation (GCC)',
  'Cleared by Community / CleanKin Drive',
  'False Report / Inaccurate Location',
  'Duplicate Report',
];

export default function MyReportsModal({ open, onClose }: MyReportsModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [reports, setReports] = useState<DumpReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DumpReport | null>(null);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!open || !isAuthenticated || !user) return;
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/dump-reports');
        if (!cancelled) {
          const data = await res.json();
          setReports(data.reports ?? []);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          console.error('Failed to fetch reports');
          setIsLoading(false);
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [open, isAuthenticated, user]);

  const handleRemoveClick = (report: DumpReport) => {
    setSelectedReport(report);
    setShowReasonPrompt(true);
    setSelectedReason('');
    setError('');
    setSuccessMsg('');
  };

  const handleConfirmRemove = async () => {
    if (!selectedReport || !selectedReason.trim()) {
      setError('Please select a reason.');
      return;
    }
    if (!user) return;
    setIsRemoving(true);
    setError('');

    const status: DumpReportStatus = selectedReason.includes('False') || selectedReason.includes('Duplicate')
      ? 'cancelled'
      : 'resolved';

    try {
      const res = await fetch('/api/dump-reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReport.id,
          status,
          cancellation_reason: selectedReason,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Report updated successfully!');
        setShowReasonPrompt(false);
        setSelectedReport(null);
        setSelectedReason('');
        setTimeout(() => {
          fetch('/api/dump-reports')
            .then((r) => r.json())
            .then((data) => setReports(data.reports ?? []))
            .catch(() => {});
        }, 500);
      } else {
        const data = await res.json();
        setError(data.error ?? 'Failed to update report.');
      }
    } catch {
      setError('An unexpected error occurred.');
    }
    setIsRemoving(false);
  };

  const getStatusBadge = (status: DumpReportStatus) => {
    switch (status) {
      case 'active': return { bg: 'bg-[#FF5470]/15', text: 'text-[#FF8FA3]', label: 'Active' };
      case 'resolved': return { bg: 'bg-[#35F27C]/15', text: 'text-[#35F27C]', label: 'Resolved' };
      case 'cancelled': return { bg: 'bg-white/5', text: 'text-[#93A89A]', label: 'Cancelled' };
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="My Reports"
    >
      <div
        className="animate-ck-modal-in bg-[#0B100D] border border-[#35F27C]/25 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(53,242,124,0.15)] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white">My Reports</h2>
            <p className="text-sm font-semibold text-[#93A89A]">
              {isLoading ? 'Loading...' : `${reports.length} report(s) submitted`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close">
            <svg className="w-6 h-6 text-[#93A89A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FF5470]/10 border border-[#FF5470]/40 rounded-xl text-[#FF8FA3] text-sm font-bold">{error}</div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-[#35F27C]/10 border border-[#35F27C]/40 rounded-xl text-[#35F27C] text-sm font-bold">{successMsg}</div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-extrabold text-white mb-2">No reports yet</p>
            <p className="text-sm text-[#93A89A]">When you report a dump spot, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const badge = getStatusBadge(report.status);
              return (
                <div key={report.id} className="border border-[#1D2B23] rounded-2xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {report.image_url ? (
                        <img src={report.image_url} alt="Report preview" className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-[#5C7263]">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002 6v12a1.5 1.5 0 001.5 1.5z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        <p className="font-bold text-white mt-1">{report.description ?? 'No description'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#93A89A]">
                    <span>Ward {report.ward_id}</span>
                    <span>📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                    <span>📅 {new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  {report.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveClick(report)}
                      className="mt-3 w-full py-2.5 rounded-xl border-2 border-dump-rose/20 text-dump-rose font-bold text-sm hover:bg-[#FF5470]/10 hover:border-dump-rose transition-all focus:outline-none"
                    >
                      Mark as Cleared / Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showReasonPrompt && selectedReport && (
          <div
            className="fixed inset-0 z-[1001] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setShowReasonPrompt(false); setError(''); }}
          >
            <div
              className="bg-[#0B100D] border border-[#35F27C]/25 rounded-3xl max-w-md w-full p-8 shadow-[0_0_50px_rgba(53,242,124,0.15)]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-extrabold text-white mb-2">Select a Reason</h3>
              <p className="text-sm text-[#93A89A] mb-4">This action will update the report status.</p>

              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {REASON_OPTIONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'border-[#35F27C] bg-[#35F27C]/10'
                        : 'border-[#1D2B23] hover:border-[#35F27C]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-[#35F27C]"
                    />
                    <span className="text-sm font-semibold text-[#C7D6CC]">{reason}</span>
                  </label>
                ))}
              </div>

              {error && <p className="text-sm font-bold text-[#FF8FA3] mb-3">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowReasonPrompt(false); setError(''); }}
                  className="flex-1 py-3 rounded-2xl border-2 border-[#1D2B23] text-[#93A89A] font-bold text-sm hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  disabled={isRemoving || !selectedReason}
                  className="flex-1 py-3 rounded-2xl bg-[#FF5470] text-[#1A0509] font-black text-sm hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-wait"
                >
                  {isRemoving ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
