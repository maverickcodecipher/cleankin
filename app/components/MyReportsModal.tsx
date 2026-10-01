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
      case 'active': return { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Active' };
      case 'resolved': return { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Resolved' };
      case 'cancelled': return { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Cancelled' };
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
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">My Reports</h2>
            <p className="text-sm font-semibold text-slate-500">
              {isLoading ? 'Loading...' : `${reports.length} report(s) submitted`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Close">
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">{error}</div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-bold">{successMsg}</div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-extrabold text-slate-800 mb-2">No reports yet</p>
            <p className="text-sm text-slate-500">When you report a dump spot, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const badge = getStatusBadge(report.status);
              return (
                <div key={report.id} className="border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {report.image_url ? (
                        <img src={report.image_url} alt="Report preview" className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002 6v12a1.5 1.5 0 001.5 1.5z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        <p className="font-bold text-slate-900 mt-1">{report.description ?? 'No description'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                    <span>Ward {report.ward_id}</span>
                    <span>📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                    <span>📅 {new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  {report.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveClick(report)}
                      className="mt-3 w-full py-2.5 rounded-xl border-2 border-dump-rose/20 text-dump-rose font-bold text-sm hover:bg-rose-50 hover:border-dump-rose transition-all focus:outline-none"
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
              className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Select a Reason</h3>
              <p className="text-sm text-slate-500 mb-4">This action will update the report status.</p>

              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {REASON_OPTIONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'border-civic-orange bg-civic-orange/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-civic-orange"
                    />
                    <span className="text-sm font-semibold text-slate-700">{reason}</span>
                  </label>
                ))}
              </div>

              {error && <p className="text-sm font-bold text-red-600 mb-3">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowReasonPrompt(false); setError(''); }}
                  className="flex-1 py-3 rounded-full border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  disabled={isRemoving || !selectedReason}
                  className="flex-1 py-3 rounded-full bg-dump-rose text-white font-bold text-sm hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-wait"
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
