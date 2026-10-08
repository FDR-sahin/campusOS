import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, BookOpen, AlertTriangle, ArrowRight, Bus, ExternalLink, ChevronRight, CheckCircle2, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Notice, Exam, EventItem, DashboardStats, NoticeSummaryResult } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { CardSkeleton } from '../common/SkeletonLoader';

interface TodayModuleProps {
  onNavigate: (tab: string) => void;
  onSelectNoticeForAI: (notice: Notice) => void;
}

export const TodayModule: React.FC<TodayModuleProps> = ({ onNavigate, onSelectNoticeForAI }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [topNotices, setTopNotices] = useState<Notice[]>([]);
  const [nextExam, setNextExam] = useState<Exam | null>(null);
  const [nextEvent, setNextEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsRes, noticesRes, examsRes, eventsRes] = await Promise.all([
          api.getDashboardStats(),
          api.getNotices(),
          api.getExams(),
          api.getEvents({ upcoming: 'true' }),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (noticesRes.success) {
          setAllNotices(noticesRes.data);
          setTopNotices(noticesRes.data.slice(0, 4));
        }
        if (examsRes.success && examsRes.data.length > 0) {
          // Prioritize student's batch/dept if available, or first upcoming
          const studentBatch = user?.batch ? String(user.batch).replace(/\D/g, '') : '';
          const matchedExam = studentBatch
            ? examsRes.data.find((e) => String(e.batch || '').replace(/\D/g, '') === studentBatch) || examsRes.data[0]
            : examsRes.data[0];
          setNextExam(matchedExam);
        }
        if (eventsRes.success && eventsRes.data.length > 0) setNextEvent(eventsRes.data[0]);
      } catch (err) {
        console.error('Failed to load today dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleQuickRsvp = async (event: EventItem) => {
    try {
      setRsvping(true);
      const res = await api.toggleRsvp(event.id);
      if (res.success) {
        setNextEvent({
          ...event,
          attendeesCount: res.count,
          attendees: res.rsvped
            ? [...(event.attendees || []), user?.id || '']
            : (event.attendees || []).filter((id) => id !== user?.id),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRsvping(false);
    }
  };

  const isUserRsvped = nextEvent && user && nextEvent.attendees?.includes(user.id);
  const urgentNotice = allNotices.find((n) => n.priority === 'URGENT') || allNotices.find((n) => Boolean(n.deadline)) || topNotices[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Student Greeting Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#243766] bg-gradient-to-b from-[#142042] to-[#0f1833] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TODAY ON CAMPUS</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good Morning, {user?.name.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="text-sm text-slate-200 max-w-2xl leading-relaxed">
              Here is your daily City University briefing. All verified deadlines, examination halls, shuttle timings, and academic alerts in one place.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-[#0c142b]/80 p-2.5 rounded-xl border border-[#253966] shrink-0 shadow-sm">
            <div className="px-3.5 py-2 text-center">
              <div className="text-lg font-bold text-rose-400 font-mono">{stats?.urgentNoticesCount ?? 3}</div>
              <div className="text-[10px] text-slate-300">Urgent Notices</div>
            </div>
            <div className="w-px h-8 bg-[#253966]" />
            <div className="px-3.5 py-2 text-center">
              <div className="text-lg font-bold text-sky-300 font-mono">{stats?.upcomingExamsCount ?? 6}</div>
              <div className="text-[10px] text-slate-300">Exams Routine</div>
            </div>
            <div className="w-px h-8 bg-[#253966]" />
            <div className="px-3.5 py-2 text-center">
              <div className="text-lg font-bold text-emerald-300 font-mono">{stats?.upcomingEventsCount ?? 4}</div>
              <div className="text-[10px] text-slate-300">Active Events</div>
            </div>
          </div>
        </div>

        {/* Priority Action Callout (Dynamically loaded from latest Admin urgent announcement) */}
        {urgentNotice && (
          <div className="mt-6 pt-6 border-t border-[#223359]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                      {urgentNotice.priority === 'URGENT' ? '🚨 Immediate Action Required' : '📌 Important Announcement'}
                    </span>
                    {urgentNotice.deadline && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-amber-200/90 font-mono">Deadline: {urgentNotice.deadline}</span>
                      </>
                    )}
                    {urgentNotice.batch && urgentNotice.batch !== 'All Batches' && (
                      <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-200 border border-amber-700/50">
                        Batch {urgentNotice.batch} {urgentNotice.section && urgentNotice.section !== 'All Sections' ? `· Sec ${urgentNotice.section}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-100 font-semibold mt-1">
                    {urgentNotice.title}
                  </p>
                  <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">
                    {urgentNotice.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onNavigate('notices')}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md flex items-center gap-1.5"
                >
                  <span>View Notice</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Next Exam & Today's Important Notices */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Exam Spotlight */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Next Scheduled Exam</h2>
              </div>
              <button
                onClick={() => onNavigate('exams')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                <span>Full Exam Routine</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {nextExam ? (
              <div className="p-5 rounded-2xl border border-[#253966] bg-[#131f3e] hover:border-sky-500/50 transition-all space-y-4 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400">{nextExam.courseCode}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-300">{nextExam.department}</span>
                    {nextExam.batch && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60">
                        Batch {nextExam.batch} {nextExam.section && nextExam.section !== 'All Sections' ? `· Sec ${nextExam.section}` : ''}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#18264d] text-sky-300 border border-sky-800/80">
                    {nextExam.examType} Exam
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{nextExam.course}</h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-200 font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      {nextExam.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      {nextExam.time}
                    </span>
                    <span className="text-slate-300">
                      📍 {nextExam.location}
                    </span>
                  </div>
                </div>

                {nextExam.notes && (
                  <p className="text-xs text-slate-300 bg-[#0c142b] p-3 rounded-xl border border-[#1e2e54]">
                    <span className="font-semibold text-white">Instructions: </span>
                    {nextExam.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#223359]">
                  <VerifiedBadge verified={nextExam.verified} sourceUrl={nextExam.sourceUrl} compact />
                  <button
                    onClick={() => onNavigate('exams')}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300"
                  >
                    Add Reminder & Routines →
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-[#253966] bg-[#131f3e]/60 text-center text-xs text-slate-400">
                No immediate exams scheduled this week.
              </div>
            )}
          </section>

          {/* Important Notices */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Top Campus Notices</h2>
              </div>
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                <span>View All Notices</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <CardSkeleton count={2} />
            ) : (
              <div className="space-y-4">
                {topNotices.map((notice) => (
                  <article
                    key={notice.id}
                    className="p-5 rounded-2xl border border-[#253966] bg-[#131f3e] hover:border-sky-500/40 transition-all space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Zero-pill metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span className="font-semibold text-sky-400">{notice.category}</span>
                        <span className="text-slate-600">·</span>
                        <span>{notice.department}</span>
                        {notice.batch && notice.batch !== 'All Batches' && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800/60">
                              Batch {notice.batch} {notice.section && notice.section !== 'All Sections' ? `· Sec ${notice.section}` : ''}
                            </span>
                          </>
                        )}
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400">Published {notice.publishedAt}</span>
                      </div>
                      {notice.priority === 'URGENT' && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                          Urgent
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {notice.title}
                    </h3>

                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {notice.description}
                    </p>

                    {notice.deadline && (
                      <div className="text-xs text-amber-300 font-mono flex items-center gap-1.5 bg-[#262013] px-2.5 py-1.5 rounded-lg border border-[#523e1e] w-fit">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Action Deadline: <strong>{notice.deadline}</strong></span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#223359]">
                      <VerifiedBadge verified={notice.verified} sourceUrl={notice.sourceUrl} compact />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectNoticeForAI(notice)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#18264d] text-sky-300 hover:bg-[#203264] border border-sky-600/50 flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Sparkles className="w-3 h-3 text-sky-400" />
                          <span>AI Summarize</span>
                        </button>
                        <button
                          onClick={() => onNavigate('notices')}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white"
                        >
                          Read Details
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (1 Col): Campus Activities, Transport Status & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Featured Club Event */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Flagship Campus Event</h2>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                All Events
              </button>
            </div>

            {nextEvent ? (
              <div className="rounded-2xl border border-[#253966] bg-[#131f3e] overflow-hidden shadow-md">
                {nextEvent.bannerImage && (
                  <div className="h-32 w-full overflow-hidden relative">
                    <img
                      src={nextEvent.bannerImage}
                      alt={nextEvent.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131f3e] to-transparent" />
                    <span className="absolute bottom-2 left-3 text-[11px] font-mono px-2 py-0.5 rounded bg-[#0c142b]/90 text-sky-300 border border-[#253966]">
                      {nextEvent.category}
                    </span>
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="text-xs text-sky-400 font-semibold">{nextEvent.club}</div>
                  <h3 className="text-sm font-bold text-white leading-tight">{nextEvent.title}</h3>
                  <div className="space-y-1 text-xs text-slate-200 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-sky-400" />
                      <span>{nextEvent.date} · {nextEvent.time}</span>
                    </div>
                    <div className="text-slate-300 truncate">📍 {nextEvent.location}</div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-mono">
                      {nextEvent.attendeesCount} RSVP'd
                    </span>
                    <button
                      onClick={() => handleQuickRsvp(nextEvent)}
                      disabled={rsvping}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isUserRsvped
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                          : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                      }`}
                    >
                      {isUserRsvped ? '✓ RSVP Confirmed' : 'RSVP Now'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          {/* Transport / Shuttle Widget */}
          <section className="p-5 rounded-2xl border border-[#253966] bg-[#131f3e] space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">City University Shuttle</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              University buses connect Mirpur, Uttara, Savar, and Gabtoli to Khagan Permanent Campus.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0c142b] border border-[#202f54] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Route 1: Mirpur-10</div>
                  <div className="text-[11px] text-slate-400 font-mono">Morning: 07:15 AM · Return: 04:30 PM</div>
                </div>
                <span className="text-[10px] text-sky-400 font-mono">Birulia Link</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0c142b] border border-[#202f54] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Route 2: Uttara Azampur</div>
                  <div className="text-[11px] text-slate-400 font-mono">Morning: 07:10 AM · Return: 04:30 PM</div>
                </div>
                <span className="text-[10px] text-sky-400 font-mono">Ashulia Link</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('transport')}
              className="w-full mt-1 py-1.5 text-xs text-center font-semibold text-sky-400 hover:text-sky-300 border border-[#253966] hover:border-sky-500/50 rounded-lg transition-colors"
            >
              View All 4 Route Schedules →
            </button>
          </section>

          {/* Quick Shortcuts */}
          <section className="p-5 rounded-2xl border border-[#253966] bg-[#131f3e] space-y-3 shadow-md">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Student Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('resources')}
                className="p-3 text-left rounded-xl bg-[#0c142b] border border-[#202f54] hover:border-sky-500/50 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-sky-400 mb-1" />
                <div className="text-xs font-semibold text-white">Resource Vault</div>
                <div className="text-[10px] text-slate-400">Past papers & notes</div>
              </button>
              <button
                onClick={() => onNavigate('helpdesk')}
                className="p-3 text-left rounded-xl bg-[#0c142b] border border-[#202f54] hover:border-sky-500/50 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-sky-400 mb-1" />
                <div className="text-xs font-semibold text-white">Smart Helpdesk</div>
                <div className="text-[10px] text-slate-400">Rules & AI Search</div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
