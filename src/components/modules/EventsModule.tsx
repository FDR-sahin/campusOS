import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  ShieldCheck,
  Check,
  Sparkles,
  Filter,
  Ticket,
  Video,
  QrCode,
  Tag,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { EventItem, Club, EventRegistration } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { CardSkeleton } from '../common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { EventTicketModal } from '../events/EventTicketModal';
import { EventDetailsModal } from '../events/EventDetailsModal';

export const EventsModule: React.FC = () => {
  const { user, refreshUser, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'clubs' | 'my-tickets'>('events');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<(EventRegistration & { event?: EventItem })[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'upcoming' | 'this-week' | 'this-month' | 'today'>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedClub, setSelectedClub] = useState('All');
  const [search, setSearch] = useState('');

  // Modals state
  const [rsvpLoadingId, setRsvpLoadingId] = useState<string | null>(null);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<EventItem | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<{ event: EventItem; registration: EventRegistration } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedTimeline, selectedCategory, selectedEventType, selectedClub, selectedDept, selectedBatch, selectedSection, search]);

  useEffect(() => {
    if (user) {
      loadMyRegistrations();
    } else {
      setMyRegistrations([]);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, clubsRes] = await Promise.all([
        api.getEvents({
          timeline: selectedTimeline !== 'all' ? selectedTimeline : undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          eventType: selectedEventType !== 'All' ? selectedEventType : undefined,
          club: selectedClub !== 'All' ? selectedClub : undefined,
          department: selectedDept !== 'All' ? selectedDept : undefined,
          batch: selectedBatch !== 'All' ? selectedBatch : undefined,
          section: selectedSection !== 'All' ? selectedSection : undefined,
          search: search.trim() ? search.trim() : undefined,
        }),
        api.getClubs(),
      ]);

      if (eventsRes.success) setEvents(eventsRes.data);
      if (clubsRes.success) setClubs(clubsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRegistrations = async () => {
    try {
      const res = await api.getMyRegistrations();
      if (res.success && res.data) {
        setMyRegistrations(res.data);
      }
    } catch (err) {
      console.error('Failed to load user event registrations', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleRsvp = async (event: EventItem) => {
    if (!user) {
      openAuthModal();
      return;
    }

    try {
      setRsvpLoadingId(event.id);
      const res = await api.toggleRsvp(event.id);
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => {
            if (e.id === event.id) {
              const attendees = res.rsvped
                ? [...(e.attendees || []), user?.id || '']
                : (e.attendees || []).filter((id) => id !== user?.id);
              return { ...e, attendeesCount: res.count, attendees };
            }
            return e;
          })
        );
        await refreshUser();
        await loadMyRegistrations();

        // If registered, open the Ticket Pass modal immediately!
        if (res.rsvped && res.registration) {
          setSelectedTicket({
            event,
            registration: res.registration,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRsvpLoadingId(null);
    }
  };

  const handleOpenTicket = (event: EventItem) => {
    const reg = myRegistrations.find((r) => r.eventId === event.id);
    if (reg) {
      setSelectedTicket({ event, registration: reg });
    } else {
      // Create fallback ticket object for student
      const fallbackReg: EventRegistration = {
        id: `reg_${event.id}`,
        ticketCode: `CU-EVT-${event.id.replace('evt_', '').slice(-4).toUpperCase()}-PASS`,
        eventId: event.id,
        userId: user?.id || 'usr_student',
        userName: user?.name || 'City University Student',
        userEmail: user?.email || 'student@cityuniversity.ac.bd',
        studentId: user?.studentId || '213-15-4921',
        department: user?.department || event.department || 'City University',
        batch: user?.batch || '65',
        section: user?.section || 'B',
        registeredAt: new Date().toISOString(),
        checkedIn: false,
        participationType: event.eventType === 'ONLINE' ? 'ONLINE' : 'IN_PERSON',
      };
      setSelectedTicket({ event, registration: fallbackReg });
    }
  };

  const categories = ['All', 'Competition', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'Career', 'Meetup'];
  const eventTypes = ['All', 'In-Person', 'Online', 'Hybrid'];
  const departments = [
    'All',
    'Computer Science & Engineering',
    'Electrical & Electronic Engineering',
    'Business Administration',
    'Civil Engineering',
    'Department of English',
    'Department of Law',
    'Department of Pharmacy',
    'Textile Engineering',
  ];
  const batches = ['All', '66', '65', '64', '63', '62', '61', '60', '59', '58'];
  const sections = ['All', 'A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
            <span>UNIFIED CAMPUS EVENT ENGINE</span>
            <span className="text-slate-600">·</span>
            <span>20+ Clubs & Departments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Events & Student Societies
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A single, verified feed for all club activities, hackathons, workshops, and seminars across City University — no need to browse 20+ disconnected Facebook groups.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shrink-0 self-start sm:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'events' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Event Feed ({events.length})</span>
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('my-tickets')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'my-tickets' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>My E-Passes ({myRegistrations.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'clubs' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Clubs Directory ({clubs.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. EVENTS FEED TAB */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Timeline & Category Bar */}
          <div className="space-y-3">
            {/* Timeline Segmented Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
                {[
                  { id: 'upcoming', label: 'Upcoming Events' },
                  { id: 'this-week', label: 'This Week' },
                  { id: 'this-month', label: 'This Month' },
                  { id: 'today', label: 'Today' },
                  { id: 'all', label: 'All Dates' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTimeline(t.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                      selectedTimeline === t.id
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Live Search */}
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search IUPC, workshop, club, batch..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
                />
              </form>
            </div>

            {/* Category Pills & Format Filter */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase shrink-0">Type:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === c
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Event Format (Online vs In-Person) */}
              <div className="flex items-center gap-1.5 ml-auto text-xs">
                <span className="text-slate-500 shrink-0">Format:</span>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="All">All Formats</option>
                  <option value="PHYSICAL">📍 In-Person</option>
                  <option value="ONLINE">🌐 Online Webinar</option>
                  <option value="HYBRID">⚡ Hybrid</option>
                </select>
              </div>
            </div>

            {/* Department, Club, Batch, Section Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 shrink-0">Club:</span>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500 max-w-xs truncate"
                >
                  <option value="All">All Clubs & Societies</option>
                  {clubs.map((clb) => (
                    <option key={clb.id} value={clb.name}>
                      {clb.code} - {clb.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 shrink-0">Department:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Departments' : d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 shrink-0">Batch:</span>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                >
                  {batches.map((b) => (
                    <option key={b} value={b}>
                      {b === 'All' ? 'All Batches' : `Batch ${b}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 shrink-0">Section:</span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                >
                  {sections.map((s) => (
                    <option key={s} value={s}>
                      {s === 'All' ? 'All' : `Sec ${s}`}
                    </option>
                  ))}
                </select>
              </div>

              {user?.batch && user?.section && (
                <button
                  onClick={() => {
                    setSelectedBatch(user.batch || 'All');
                    setSelectedSection(user.section || 'All');
                    if (user.department) setSelectedDept(user.department);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto"
                >
                  <span>🎓 My Class ({user.batch} {user.section})</span>
                </button>
              )}
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <CardSkeleton count={4} />
          ) : events.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
              <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No campus events match your filters</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No events currently scheduled under the selected timeline and club filters. Check back soon for upcoming sessions.
              </p>
              <button
                onClick={() => {
                  setSelectedTimeline('all');
                  setSelectedCategory('All');
                  setSelectedEventType('All');
                  setSelectedClub('All');
                  setSelectedDept('All');
                  setSelectedBatch('All');
                  setSelectedSection('All');
                  setSearch('');
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-md inline-block"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => {
                const isRsvped = (user && event.attendees?.includes(user.id)) || myRegistrations.some((r) => r.eventId === event.id);
                const isLoadingThis = rsvpLoadingId === event.id;
                const isOnline = event.eventType === 'ONLINE' || event.eventType === 'HYBRID';

                return (
                  <article
                    key={event.id}
                    className="rounded-3xl border border-[#253966] bg-[#131f3e] overflow-hidden flex flex-col hover:border-sky-500/60 transition-all group shadow-xl relative"
                  >
                    {/* Banner Image */}
                    {event.bannerImage && (
                      <div className="h-48 w-full relative overflow-hidden bg-[#0c142b]">
                        <img
                          src={event.bannerImage}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#131f3e] via-[#131f3e]/40 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#0c142b]/90 text-sky-300 border border-[#253966] backdrop-blur-sm">
                            {event.category}
                          </span>
                          {event.eventType && (
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
                                event.eventType === 'ONLINE'
                                  ? 'bg-purple-950/90 text-purple-300 border border-purple-800'
                                  : event.eventType === 'HYBRID'
                                  ? 'bg-amber-950/90 text-amber-300 border border-amber-800'
                                  : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {event.eventType === 'ONLINE' ? '🌐 ONLINE' : event.eventType === 'HYBRID' ? '⚡ HYBRID' : '📍 IN-PERSON'}
                            </span>
                          )}
                        </div>

                        {/* Registered Badge overlay on top right */}
                        {isRsvped && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-[10px] font-mono font-bold shadow-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>REGISTERED</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Club & Host meta */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-sky-400 truncate">{event.club}</span>
                            {event.batch && event.batch !== 'All Batches' && (
                              <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 font-mono text-[10px] border border-sky-800/50">
                                Batch {event.batch}
                              </span>
                            )}
                            {event.section && event.section !== 'All Sections' && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-mono text-[10px] border border-amber-800/50">
                                Sec {event.section}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-slate-400 text-[11px]">Host: {event.host}</span>
                        </div>

                        {/* Title */}
                        <h2
                          onClick={() => setSelectedEventForDetails(event)}
                          className="text-base sm:text-lg font-bold text-white leading-snug hover:text-sky-300 cursor-pointer transition-colors"
                        >
                          {event.title}
                        </h2>

                        {/* Description */}
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {event.description}
                        </p>

                        {/* Date & Location */}
                        <div className="space-y-1.5 pt-1 text-xs text-slate-200 font-mono">
                          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{event.date} · {event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        {/* Online Direct Link if Online event */}
                        {isOnline && event.onlineMeetingUrl && (
                          <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-purple-300">
                              <Video className="w-3.5 h-3.5" />
                              <span className="font-medium">Online Stream Link Ready</span>
                            </div>
                            <a
                              href={event.onlineMeetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <span>Join Meeting</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-[#223359] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                          <Users className="w-3.5 h-3.5 text-sky-400" />
                          <span>{event.attendeesCount} RSVPs</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedEventForDetails(event)}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#18264d] transition-colors"
                            title="Full Event Details"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          {isRsvped ? (
                            <button
                              onClick={() => handleOpenTicket(event)}
                              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5 transition-all"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>View E-Pass & QR</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleRsvp(event)}
                              disabled={isLoadingThis}
                              className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {isLoadingThis ? (
                                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Ticket className="w-3.5 h-3.5" />
                                  <span>RSVP / Register</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MY REGISTERED E-PASSES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'my-tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                My Registered Events & Entry Passes
              </h2>
              <p className="text-xs text-slate-400">
                Show your scannable digital passes at the event entrance for fast check-in.
              </p>
            </div>
          </div>

          {myRegistrations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
              <Ticket className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No active event registrations</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You have not registered for any upcoming campus events yet. Explore the unified feed and RSVP in one click.
              </p>
              <button
                onClick={() => setActiveTab('events')}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-md inline-block"
              >
                Browse Upcoming Events →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRegistrations.map((reg) => {
                const event = reg.event || events.find((e) => e.id === reg.eventId);
                if (!event) return null;

                return (
                  <div
                    key={reg.id}
                    className="p-5 rounded-3xl border border-slate-700/80 bg-gradient-to-b from-[#131f3e] to-[#0c142b] shadow-xl space-y-4 hover:border-sky-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-sky-400 font-bold uppercase">
                          {event.club}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                            reg.checkedIn
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-sky-950 text-sky-300 border border-sky-800'
                          }`}
                        >
                          {reg.checkedIn ? '✓ CHECKED IN' : 'VALID PASS'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">{event.title}</h3>

                      <div className="space-y-1 text-xs text-slate-300 font-mono">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{event.date} · {event.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Ticket ID</span>
                          <p className="font-mono font-bold text-sky-300">{reg.ticketCode}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Attendee</span>
                          <p className="font-medium text-white">{reg.userName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
                      <button
                        onClick={() => handleToggleRsvp(event)}
                        className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        Cancel RSVP
                      </button>

                      <button
                        onClick={() => setSelectedTicket({ event, registration: reg })}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View QR Ticket</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CLUBS DIRECTORY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'clubs' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Official Student Clubs & Communities Directory
            </h2>
            <p className="text-xs text-slate-400">
              Active student societies, executive committee advisors, and direct membership channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all space-y-3.5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400 px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800/60">
                    {club.code}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{club.membersCount} Members</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white leading-snug">{club.name}</h3>
                  <p className="text-xs text-sky-400/90 mt-0.5">{club.department}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {club.shortDescription}
                </p>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Advisor: {club.lead}</span>
                  <a
                    href={club.officialPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <span>Club Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODALS: Details & Ticket Pass */}
      {/* ========================================================================= */}
      {selectedEventForDetails && (
        <EventDetailsModal
          isOpen={!!selectedEventForDetails}
          onClose={() => setSelectedEventForDetails(null)}
          event={selectedEventForDetails}
          registration={myRegistrations.find((r) => r.eventId === selectedEventForDetails.id)}
          onToggleRsvp={handleToggleRsvp}
          onViewTicket={(evt) => {
            setSelectedEventForDetails(null);
            handleOpenTicket(evt);
          }}
          rsvpLoading={rsvpLoadingId === selectedEventForDetails.id}
        />
      )}

      {selectedTicket && (
        <EventTicketModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          event={selectedTicket.event}
          registration={selectedTicket.registration}
        />
      )}
    </div>
  );
};
