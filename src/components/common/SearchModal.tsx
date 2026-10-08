import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Sparkles,
  Clock,
  Calendar,
  BookOpen,
  Bus,
  ShieldAlert,
  Users,
  ArrowRight,
  MapPin,
  FileText,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  Notice,
  Exam,
  EventItem,
  ResourceItem,
  BusSchedule,
  LostFoundItem,
  DirectoryContact,
} from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [buses, setBuses] = useState<BusSchedule[]>([]);
  const [lostItems, setLostItems] = useState<LostFoundItem[]>([]);
  const [directory, setDirectory] = useState<DirectoryContact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setNotices([]);
      setExams([]);
      setEvents([]);
      setResources([]);
      setBuses([]);
      setLostItems([]);
      setDirectory([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase().trim();

      try {
        const [nRes, exRes, evRes, rRes, bRes, lfRes, dirRes] = await Promise.all([
          api.getNotices({ search: query }),
          api.getExams({ search: query }),
          api.getEvents({ search: query }),
          api.getResources({ search: query }),
          api.getBusSchedules(),
          api.getLostFound(),
          api.getDirectory(),
        ]);

        if (nRes.success) setNotices(nRes.data.slice(0, 4));
        if (exRes.success) setExams(exRes.data.slice(0, 4));
        if (evRes.success) setEvents(evRes.data.slice(0, 3));
        if (rRes.success) setResources(rRes.data.slice(0, 4));

        if (bRes.success) {
          setBuses(
            bRes.data
              .filter(
                (b) =>
                  b.routeName.toLowerCase().includes(q) ||
                  b.departurePoint.toLowerCase().includes(q) ||
                  b.destination.toLowerCase().includes(q) ||
                  (b.viaPoints && b.viaPoints.some((p) => p.toLowerCase().includes(q)))
              )
              .slice(0, 3)
          );
        }

        if (lfRes.success) {
          setLostItems(
            lfRes.data
              .filter(
                (item) =>
                  item.title.toLowerCase().includes(q) ||
                  item.description.toLowerCase().includes(q) ||
                  item.location.toLowerCase().includes(q) ||
                  item.category.toLowerCase().includes(q) ||
                  (q.includes('watch') && (item.title.toLowerCase().includes('watch') || item.description.toLowerCase().includes('watch') || item.description.toLowerCase().includes('ghori'))) ||
                  (q.includes('ghori') && (item.title.toLowerCase().includes('watch') || item.description.toLowerCase().includes('watch') || item.description.toLowerCase().includes('ghori'))) ||
                  (q.includes('lost') && item.type === 'LOST') ||
                  (q.includes('found') && item.type === 'FOUND')
              )
              .slice(0, 4)
          );
        }

        if (dirRes.success) {
          setDirectory(
            dirRes.data
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(q) ||
                  c.designation.toLowerCase().includes(q) ||
                  c.department.toLowerCase().includes(q) ||
                  c.officeLocation.toLowerCase().includes(q) ||
                  c.email.toLowerCase().includes(q) ||
                  c.phone.includes(q) ||
                  (q.includes('teacher') || q.includes('sir') || q.includes('faculty') ? true : false)
              )
              .slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Search query error', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const hasResults =
    notices.length > 0 ||
    exams.length > 0 ||
    events.length > 0 ||
    resources.length > 0 ||
    buses.length > 0 ||
    lostItems.length > 0 ||
    directory.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
          <Search className="w-5 h-5 text-sky-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything: lost watch, teachers, CSE 311 routine, shuttle, notices..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {loading && (
            <div className="py-8 text-center text-xs text-sky-400 font-mono flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-sky-400/20 border-t-sky-400 rounded-full animate-spin" />
              <span>Scanning City University campus database...</span>
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-slate-300">Omni Campus Search</p>
                <p className="text-[11px] text-slate-400">Search instantly across lost items, teachers, exams, shuttle bus, and study files.</p>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {[
                  { label: 'Lost & Found', tab: 'lostfound', icon: ShieldAlert, color: 'text-amber-400 border-amber-800/40 bg-amber-950/20' },
                  { label: 'Faculty Directory', tab: 'helpdesk', icon: Users, color: 'text-purple-400 border-purple-800/40 bg-purple-950/20' },
                  { label: 'Exam Routine', tab: 'exams', icon: Clock, color: 'text-sky-400 border-sky-800/40 bg-sky-950/20' },
                  { label: 'Shuttle Bus', tab: 'transport', icon: Bus, color: 'text-teal-400 border-teal-800/40 bg-teal-950/20' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        onNavigate(item.tab);
                        onClose();
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 hover:opacity-90 transition-all ${item.color}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-medium text-white">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <div className="text-[11px] text-slate-500 font-mono mb-2">Popular Searches:</div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {['Lost Watch', 'CSE 311 Final Exam', 'Mirpur Shuttle #09', 'Dr. Rashedul Islam', 'Tuition Fee Waiver', 'Advising Fall 2026'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && query && !hasResults && (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-semibold text-white">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Couldn't find an exact match in current notices or items. You can submit a question in Helpdesk or report a lost item.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    onNavigate('lostfound');
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                >
                  Report Lost Item →
                </button>
                <button
                  onClick={() => {
                    onNavigate('helpdesk');
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                >
                  Open Helpdesk →
                </button>
              </div>
            </div>
          )}

          {/* 1. LOST & FOUND MATCHES */}
          {lostItems.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Lost & Found Items ({lostItems.length})</span>
              </div>
              {lostItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigate('lostfound');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-amber-900/40 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          item.type === 'LOST'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700/60'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                        }`}
                      >
                        {item.type}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-amber-400" />
                        {item.location}
                      </span>
                      <span>·</span>
                      <span>Contact: {item.contactName} ({item.contactMethod})</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 mt-1 transition-colors" />
                </div>
              ))}
            </div>
          )}

          {/* 2. FACULTY & TEACHERS DIRECTORY */}
          {directory.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Teachers & Campus Directory ({directory.length})</span>
              </div>
              {directory.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onNavigate('helpdesk');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-purple-900/40 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0 overflow-hidden">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono text-purple-400">· {c.designation}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {c.department} · Room: {c.officeLocation} · {c.phone}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 shrink-0 transition-colors" />
                </div>
              ))}
            </div>
          )}

          {/* 3. NOTICES */}
          {notices.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Notices ({notices.length})</span>
              </div>
              {notices.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    onNavigate('notices');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors space-y-1 group"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                      {n.title}
                    </span>
                    {n.batch && n.batch !== 'All Batches' && (
                      <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-mono text-[10px] border border-sky-800">
                        Batch {n.batch}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{n.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* 4. EXAMS */}
          {exams.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Exams Routine ({exams.length})</span>
              </div>
              {exams.map((e) => (
                <div
                  key={e.id}
                  onClick={() => {
                    onNavigate('exams');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {e.courseCode} · {e.course}
                      </span>
                      {e.batch && (
                        <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-mono text-[10px] border border-sky-800">
                          Batch {e.batch}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{e.date} · {e.time} · {e.location}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 transition-colors" />
                </div>
              ))}
            </div>
          )}

          {/* 5. STUDY RESOURCES */}
          {resources.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Study Vault & Slides ({resources.length})</span>
              </div>
              {resources.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    onNavigate('resources');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {r.title}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono">{r.courseCode} · {r.category} · {r.department}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 transition-colors" />
                </div>
              ))}
            </div>
          )}

          {/* 6. SHUTTLE BUSES */}
          {buses.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-semibold flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5" />
                <span>Campus Shuttle Routes ({buses.length})</span>
              </div>
              {buses.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    onNavigate('transport');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                      {b.routeName} ({b.routeNumber})
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      From: {b.departurePoint} ➔ {b.destination} · Morning: {b.morningDepTime}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-300 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Tip: Press ESC to close · Type "watch" or teacher name to search</span>
          <span className="text-sky-400">CampusOS Universal Index</span>
        </div>
      </div>
    </div>
  );
};
