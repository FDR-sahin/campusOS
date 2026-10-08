import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, Bookmark, ExternalLink, Clock, AlertTriangle, ShieldCheck, X, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { Notice, NoticeSummaryResult } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { CardSkeleton } from '../common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';

interface NoticesModuleProps {
  initialNoticeForAI?: Notice | null;
  onClearInitialNoticeForAI?: () => void;
}

export const NoticesModule: React.FC<NoticesModuleProps> = ({ initialNoticeForAI, onClearInitialNoticeForAI }) => {
  const { user, refreshUser } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');

  // AI Modal State
  const [activeNoticeForAI, setActiveNoticeForAI] = useState<Notice | null>(null);
  const [aiSummary, setAiSummary] = useState<NoticeSummaryResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Close AI modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeNoticeForAI) {
        setActiveNoticeForAI(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNoticeForAI]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotices();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedDept, selectedBatch, selectedSection, search]);

  useEffect(() => {
    if (initialNoticeForAI) {
      handleOpenAiSummarizer(initialNoticeForAI);
      if (onClearInitialNoticeForAI) onClearInitialNoticeForAI();
    }
  }, [initialNoticeForAI]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const res = await api.getNotices({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        department: selectedDept !== 'All' ? selectedDept : undefined,
        batch: selectedBatch !== 'All' ? selectedBatch : undefined,
        section: selectedSection !== 'All' ? selectedSection : undefined,
        search: search.trim() ? search.trim() : undefined,
      });
      if (res.success) {
        setNotices(res.data);
      }
    } catch (err) {
      console.error('Failed to load notices', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadNotices();
  };

  const handleToggleSave = async (noticeId: string) => {
    try {
      await api.toggleSaveNotice(noticeId);
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAiSummarizer = async (notice: Notice) => {
    setActiveNoticeForAI(notice);
    setAiSummary(null);
    setAiError(null);
    setAiLoading(true);
    try {
      const res = await api.summarizeNotice(notice.id);
      if (res.success) {
        setAiSummary(res.data);
      } else {
        setAiError('Failed to generate notice summary');
      }
    } catch (err: any) {
      setAiError(err.message || 'AI Summarizer service error');
    } finally {
      setAiLoading(false);
    }
  };

  const categories = ['All', 'Academic', 'Examination', 'Transport', 'Scholarship', 'Holiday', 'General'];
  const departments = ['All', 'Computer Science & Engineering', 'Electrical & Electronic Engineering', 'Business Administration', 'Civil Engineering', 'Department of English', 'Department of Law'];
  const batches = ['All', '66', '65', '64', '63', '62', '61', '60', '59', '58'];
  const sections = ['All', 'A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
            <span>OFFICIAL NOTICES & ANNOUNCEMENTS</span>
            <span className="text-slate-600">·</span>
            <span>City University Verified Stream</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">University Notices</h1>
          <p className="text-xs text-slate-400 mt-1">
            Administrative notices converted into clear student action items. No missing deadlines or hidden routines.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notice, batch, or section (e.g. 65b)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 shadow-sm"
          />
        </form>
      </div>

      {/* Filter Controls */}
      <div className="space-y-3">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-500 mr-2 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/80 hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Department, Batch, and Section Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
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
              className="px-2.5 py-1.5 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-300 hover:bg-sky-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>🎓 My Class ({user.batch} {user.section})</span>
            </button>
          )}
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : notices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/50 space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
          <h3 className="text-sm font-semibold text-white">No notices found</h3>
          <p className="text-xs text-slate-400">
            No notices match your current search or filters. Check back later for official updates from City University.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            const isSaved = user?.savedNotices?.includes(notice.id);
            return (
              <article
                key={notice.id}
                className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition-all space-y-3.5 relative group shadow-sm"
              >
                {/* Header Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-sky-400">{notice.category}</span>
                    <span className="text-slate-600">·</span>
                    <span>{notice.department}</span>
                    {notice.batch && notice.batch !== 'All Batches' && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="px-2 py-0.5 rounded bg-sky-950/70 text-sky-300 font-mono text-[11px] border border-sky-800/50">
                          Batch {notice.batch}
                        </span>
                      </>
                    )}
                    {notice.section && notice.section !== 'All Sections' && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 font-mono text-[11px] border border-amber-800/50">
                        Sec {notice.section}
                      </span>
                    )}
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-slate-400">Published {notice.publishedAt}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500">{notice.views} views</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {notice.priority === 'URGENT' && (
                      <span className="flex items-center gap-1.5 text-xs font-mono text-rose-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        Urgent Notice
                      </span>
                    )}
                    {notice.priority === 'IMPORTANT' && (
                      <span className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-medium">
                        Important
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleSave(notice.id)}
                      title={isSaved ? 'Remove bookmark' : 'Bookmark notice'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved
                          ? 'bg-sky-950 text-sky-400 border-sky-800'
                          : 'text-slate-400 hover:text-white border-transparent hover:border-slate-800'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                  {notice.title}
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {notice.description}
                </p>

                {notice.deadline && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/60 flex items-center gap-2 text-xs text-amber-300 font-mono">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Action Deadline: <strong>{notice.deadline}</strong></span>
                  </div>
                )}

                {notice.actionPrompt && (
                  <div className="text-xs text-sky-300 font-medium flex items-center gap-1.5">
                    <span className="text-slate-400">Next Action:</span>
                    <span>{notice.actionPrompt}</span>
                  </div>
                )}

                {/* Footer Controls: Verified badge + AI Button + Source */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <VerifiedBadge verified={notice.verified} sourceUrl={notice.sourceUrl} />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAiSummarizer(notice)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800/80 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>✨ AI Summarizer</span>
                    </button>

                    {notice.actionUrl && (
                      <a
                        href={notice.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm"
                      >
                        Proceed to Portal →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* AI Notice Summarizer Modal with Fixed Header and Scrollable Body */}
      {activeNoticeForAI && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveNoticeForAI(null);
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Fixed Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-slate-800 bg-slate-900/95 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-sky-950 border border-sky-800 text-[11px] font-mono uppercase tracking-wider text-sky-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    AI Notice Synthesizer
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-mono">Gemini 3.8 Flash Engine</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {activeNoticeForAI.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveNoticeForAI(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Close modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {aiLoading ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-10 h-10 border-3 border-sky-500/20 border-t-sky-400 rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-300 font-mono">
                    Synthesizing official notice into structured student actions...
                  </p>
                </div>
              ) : aiError ? (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {aiError}
                </div>
              ) : aiSummary ? (
                <div className="space-y-3.5">
                  {/* 1. What is this about? */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider font-mono">
                      1. What is this about?
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
                      {aiSummary.about}
                    </p>
                  </div>

                  {/* 2. Who is affected? */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider font-mono">
                      2. Who is affected?
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
                      {aiSummary.whoIsAffected}
                    </p>
                  </div>

                  {/* 3. Important Dates & Deadlines */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-900/60 space-y-1">
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>3. Important Dates & Deadlines</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-200 font-mono">
                      {aiSummary.importantDates}
                    </p>
                  </div>

                  {/* 4. Required Action */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-900/60 space-y-1">
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>4. Required Student Action</span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                      {aiSummary.requiredAction}
                    </p>
                  </div>

                  {/* Zero Hallucination Guarantee Note */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Grounded strictly on official City University notice
                    </span>
                    <a
                      href={activeNoticeForAI.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Original Notice</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Fixed Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end">
              <button
                onClick={() => setActiveNoticeForAI(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
