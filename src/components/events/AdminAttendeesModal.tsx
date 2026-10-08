import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  CheckCircle2,
  AlertCircle,
  Camera,
  Search,
  Download,
  Filter,
  RefreshCw,
  QrCode,
  Sparkles,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import { EventItem, EventRegistration } from '../../types';
import { DoorScannerModal } from './DoorScannerModal';

interface AdminAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

export const AdminAttendeesModal: React.FC<AdminAttendeesModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [stats, setStats] = useState<{ total: number; checkedIn: number; pending: number; maxCapacity: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CHECKED_IN' | 'PENDING'>('ALL');
  const [doorScannerOpen, setDoorScannerOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && event) {
      loadAttendees();
    }
  }, [isOpen, event]);

  const loadAttendees = async () => {
    if (!event) return;
    try {
      setLoading(true);
      const res = await api.getEventAttendees(event.id);
      if (res.success && res.data) {
        setRegistrations(res.data.registrations || []);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load event attendees', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheckin = async (registrationId: string) => {
    try {
      setTogglingId(registrationId);
      const res = await api.toggleAttendeeCheckin(registrationId);
      if (res.success && res.registration) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === registrationId ? res.registration : r))
        );
        // recalculate stats
        setStats((curr) => {
          if (!curr) return null;
          const isNowChecked = res.registration.checkedIn;
          const diff = isNowChecked ? 1 : -1;
          return {
            ...curr,
            checkedIn: Math.max(0, curr.checkedIn + diff),
            pending: Math.max(0, curr.pending - diff),
          };
        });
      }
    } catch (err) {
      console.error('Failed to toggle attendee checkin', err);
    } finally {
      setTogglingId(null);
    }
  };

  if (!isOpen || !event) return null;

  const filteredRegistrations = registrations.filter((reg) => {
    if (statusFilter === 'CHECKED_IN' && !reg.checkedIn) return false;
    if (statusFilter === 'PENDING' && reg.checkedIn) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = reg.userName?.toLowerCase().includes(q);
      const matchId = reg.studentId?.toLowerCase().includes(q);
      const matchCode = reg.ticketCode?.toLowerCase().includes(q);
      const matchDept = reg.department?.toLowerCase().includes(q);
      const matchBatch = reg.batch?.toLowerCase().includes(q);
      return matchName || matchId || matchCode || matchDept || matchBatch;
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = ['Ticket ID', 'Student Name', 'Student ID', 'Email', 'Department', 'Batch', 'Section', 'Mode', 'Check-In Status', 'Check-In Time', 'Registration Time'];
    const rows = registrations.map((r) => [
      `"${r.ticketCode}"`,
      `"${r.userName}"`,
      `"${r.studentId}"`,
      `"${r.userEmail}"`,
      `"${r.department}"`,
      `"${r.batch || ''}"`,
      `"${r.section || ''}"`,
      `"${r.participationType}"`,
      `"${r.checkedIn ? 'CHECKED_IN' : 'PENDING'}"`,
      `"${r.checkedInAt || ''}"`,
      `"${r.registeredAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendees-${event.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
                <span>EVENT PARTICIPATION & ATTENDANCE ENGINE</span>
                <span className="text-slate-600">·</span>
                <span>{event.club}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {event.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Live attendee roster, QR door check-in logs, and registration management.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setDoorScannerOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/25"
              >
                <Camera className="w-4 h-4" />
                <span>Open Door QR Scanner</span>
              </button>
            </div>
          </div>

          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Total RSVPs</span>
              <p className="text-2xl font-bold font-mono text-white">{stats?.total ?? registrations.length}</p>
              <span className="text-[11px] text-slate-400">Registered Students</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Checked In</span>
              <p className="text-2xl font-bold font-mono text-emerald-300">{stats?.checkedIn ?? 0}</p>
              <span className="text-[11px] text-emerald-400">At Event Gate</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/50 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase">Pending Entry</span>
              <p className="text-2xl font-bold font-mono text-amber-300">{stats?.pending ?? 0}</p>
              <span className="text-[11px] text-amber-400">Awaiting Check-in</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/50 space-y-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase">Attendance Rate</span>
              <p className="text-2xl font-bold font-mono text-purple-300">
                {stats && stats.total > 0
                  ? `${Math.round((stats.checkedIn / stats.total) * 100)}%`
                  : '0%'}
              </p>
              <span className="text-[11px] text-purple-400">
                {event.maxCapacity ? `Max ${event.maxCapacity} Seats` : 'Open Seating'}
              </span>
            </div>
          </div>

          {/* Search, Filter & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by student name, ID, or ticket..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
                {(['ALL', 'CHECKED_IN', 'PENDING'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      statusFilter === filter
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter === 'CHECKED_IN' ? 'Checked In' : 'Pending'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadAttendees}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Refresh Roster"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
              </button>

              <button
                onClick={handleExportCsv}
                disabled={registrations.length === 0}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Attendees Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-400" />
                <p className="text-xs">Loading attendee records...</p>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-semibold text-white">No registered attendees found</p>
                <p className="text-xs text-slate-500">
                  {search ? 'Try adjusting your search criteria.' : 'No students have registered for this event yet.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Ticket #</th>
                    <th className="p-3.5">Student Details</th>
                    <th className="p-3.5">Class / Dept</th>
                    <th className="p-3.5">Mode</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Door Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-sky-300 font-bold">
                        {reg.ticketCode}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-white">{reg.userName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{reg.studentId} · {reg.userEmail}</div>
                      </td>

                      <td className="p-3.5 text-slate-300">
                        <div className="truncate max-w-xs">{reg.department}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Batch {reg.batch || '65'} ({reg.section || 'B'})
                        </div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            reg.participationType === 'ONLINE'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {reg.participationType === 'ONLINE' ? '🌐 ONLINE' : '📍 IN-PERSON'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {reg.checkedIn ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Checked In</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span>Pending</span>
                          </div>
                        )}
                        {reg.checkedInAt && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {new Date(reg.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleCheckin(reg.id)}
                          disabled={togglingId === reg.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            reg.checkedIn
                              ? 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          }`}
                        >
                          {togglingId === reg.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : reg.checkedIn ? (
                            'Undo Check-In'
                          ) : (
                            'Mark Checked In'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Door Scanner Sub-Modal */}
      {doorScannerOpen && (
        <DoorScannerModal
          isOpen={doorScannerOpen}
          onClose={() => setDoorScannerOpen(false)}
          event={event}
          onCheckInSuccess={(updatedReg) => {
            setRegistrations((prev) =>
              prev.map((r) => (r.id === updatedReg.id ? updatedReg : r))
            );
            setStats((curr) => (curr ? { ...curr, checkedIn: curr.checkedIn + 1, pending: Math.max(0, curr.pending - 1) } : null));
          }}
        />
      )}
    </>
  );
};

