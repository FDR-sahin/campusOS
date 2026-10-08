import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Search, Bookmark, MapPin, AlertCircle, CheckCircle2, Bell, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { Exam } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { CardSkeleton } from '../common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';

export const ExamsModule: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [search, setSearch] = useState('');
  const [reminderAdded, setReminderAdded] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExams();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedDept, selectedType, selectedBatch, selectedSection, search]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const res = await api.getExams({
        department: selectedDept !== 'All' ? selectedDept : undefined,
        examType: selectedType !== 'All' ? selectedType : undefined,
        batch: selectedBatch !== 'All' ? selectedBatch : undefined,
        section: selectedSection !== 'All' ? selectedSection : undefined,
        search: search.trim() ? search.trim() : undefined,
      });
      if (res.success) {
        setExams(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadExams();
  };

  const handleToggleSave = async (examId: string) => {
    try {
      await api.toggleSaveExam(examId);
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReminder = (exam: Exam) => {
    setReminderAdded(exam.id);
    setTimeout(() => {
      setReminderAdded(null);
    }, 3000);
  };

  const departments = ['All', 'Computer Science & Engineering', 'Electrical & Electronic Engineering', 'Business Administration', 'Civil Engineering'];
  const examTypes = ['All', 'Final', 'Midterm', 'Quiz'];
  const batches = ['All', '66', '65', '64', '63', '62', '61', '60', '59', '58'];
  const sections = ['All', 'A', 'B', 'C', 'D', 'E'];

  const getDaysLeft = (examDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(examDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    return `in ${diffDays} days`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
            <span>OFFICIAL EXAMINATION SCHEDULE</span>
            <span className="text-slate-600">·</span>
            <span>Controller of Examinations</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Exam Schedules & Routines</h1>
          <p className="text-xs text-slate-400 mt-1">
            Verified course timings, hall allocations at Permanent Campus (Khagan), and exam regulations.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course code, batch (e.g. 65b)..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </form>
      </div>

      {/* Filter Segmented Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Exam Type Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto">
            {examTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  selectedType === t
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'All' ? 'All Routines' : `${t} Exams`}
              </button>
            ))}
          </div>

          {/* Department Select */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 shrink-0">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch & Section Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2">
            <span className="text-slate-500 shrink-0">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            >
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Sections' : `Section ${s}`}
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
              className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:bg-amber-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>🎓 My Class ({user.batch} {user.section})</span>
            </button>
          )}
        </div>
      </div>

      {reminderAdded && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Exam reminder synced to your CampusOS profile! We will notify you before exam day.</span>
        </div>
      )}

      {/* Routine Grid */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : exams.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No exam schedule found</h3>
          <p className="text-xs text-slate-400">
            No routines published yet for the selected department. Please verify official departmental notice boards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const isSaved = user?.savedExams?.includes(exam.id);
            const daysLeft = getDaysLeft(exam.date);
            const isPast = daysLeft.includes('ago');

            return (
              <div
                key={exam.id}
                className={`p-5 rounded-2xl border transition-all space-y-3.5 relative shadow-md ${
                  isPast
                    ? 'border-[#202f54] bg-[#0c142b]/60 opacity-75'
                    : 'border-[#253966] bg-[#131f3e] hover:border-sky-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">{exam.courseCode}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-300">{exam.department.split('&')[0]}</span>
                    {exam.batch && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 font-mono text-[10px] border border-sky-800/50">
                          Batch {exam.batch}
                        </span>
                      </>
                    )}
                    {exam.section && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-mono text-[10px] border border-amber-800/50">
                        Sec {exam.section}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0c142b] border border-[#253966] text-slate-300">
                      {exam.examType}
                    </span>
                    <button
                      onClick={() => handleToggleSave(exam.id)}
                      title={isSaved ? 'Remove from My Exams' : 'Bookmark Exam'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved
                          ? 'bg-[#18264d] text-sky-400 border-sky-800'
                          : 'text-slate-400 hover:text-white border-transparent hover:border-[#253966]'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white leading-snug">{exam.course}</h3>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-200 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        {exam.date}
                      </span>
                      <span className="text-amber-400 font-semibold">{daysLeft}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>{exam.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.location}</span>
                    </div>
                  </div>
                </div>

                {exam.notes && (
                  <p className="text-xs text-slate-300 bg-[#0c142b] p-2.5 rounded-xl border border-[#1e2e54]">
                    <span className="text-white font-semibold">Hall Note: </span>
                    {exam.notes}
                  </p>
                )}

                <div className="pt-2 border-t border-[#223359] flex items-center justify-between">
                  <VerifiedBadge verified={exam.verified} sourceUrl={exam.sourceUrl} compact />
                  <button
                    onClick={() => handleAddReminder(exam)}
                    className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <Bell className="w-3 h-3" />
                    <span>Add Reminder</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
