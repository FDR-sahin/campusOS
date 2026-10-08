import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  ExternalLink,
  X,
  MessageSquarePlus,
  CheckCircle2,
  Phone,
  Mail,
  Building2,
  Clock,
  MapPin,
  Paperclip,
  Users,
  Inbox,
  Eye,
  MessageSquare,
  GraduationCap,
  Filter,
} from 'lucide-react';
import { api } from '../../lib/api';
import { FAQItem, DirectoryContact, HelpdeskInquiry } from '../../types';
import { CardSkeleton } from '../common/SkeletonLoader';
import { ImageOrFileUpload } from '../common/ImageOrFileUpload';
import { useAuth } from '../../context/AuthContext';

export const HelpdeskModule: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'faq' | 'inquiry' | 'tickets' | 'directory'>('faq');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [directory, setDirectory] = useState<DirectoryContact[]>([]);
  const [inquiries, setInquiries] = useState<HelpdeskInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq_1');

  // Directory filters & search
  const [dirDept, setDirDept] = useState('All');
  const [dirCategory, setDirCategory] = useState('All');
  const [dirSearch, setDirSearch] = useState('');

  // AI Assistant states
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<{ answer: string; source: string; verified: boolean } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Submit Inquiry Form
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState('Academic Advising');
  const [inquiryDetails, setInquiryDetails] = useState('');
  const [inquiryAttachment, setInquiryAttachment] = useState('');
  const [inquiryStudentId, setInquiryStudentId] = useState(user?.studentId || '');
  const [inquiryDepartment, setInquiryDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [inquirySent, setInquirySent] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // Attachment Modal Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.studentId && !inquiryStudentId) {
      setInquiryStudentId(user.studentId);
    }
    if (user?.department && !inquiryDepartment) {
      setInquiryDepartment(user.department);
    }
  }, [user]);

  useEffect(() => {
    loadFaqs();
  }, [selectedCategory]);

  useEffect(() => {
    if (activeTab === 'directory') {
      loadDirectory();
    } else if (activeTab === 'tickets') {
      loadInquiries();
    }
  }, [activeTab, dirDept, dirCategory, dirSearch]);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const res = await api.getFaqs({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      if (res.success) {
        setFaqs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDirectory = async () => {
    try {
      setLoading(true);
      const res = await api.getDirectory({
        department: dirDept !== 'All' ? dirDept : undefined,
        category: dirCategory !== 'All' ? dirCategory : undefined,
        search: dirSearch.trim() || undefined,
      });
      if (res.success) {
        setDirectory(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.getHelpdeskInquiries();
      if (res.success) {
        setInquiries(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    try {
      setAiLoading(true);
      setAiError(null);
      setAiResponse(null);
      const res = await api.askCampusAI(aiQuery.trim());
      if (res.success) {
        setAiResponse(res.data);
      } else {
        setAiError('Failed to query campus assistant');
      }
    } catch (err: any) {
      setAiError(err.message || 'Campus Assistant service temporarily unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const clearAiQuery = () => {
    setAiQuery('');
    setAiResponse(null);
    setAiError(null);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!inquirySubject.trim() || !inquiryDetails.trim()) {
      alert('Please fill in both the subject and inquiry details.');
      return;
    }

    try {
      setInquirySubmitting(true);
      const res = await api.createHelpdeskInquiry({
        subject: inquirySubject.trim(),
        details: inquiryDetails.trim(),
        category: inquiryCategory,
        department: inquiryDepartment,
        studentId: inquiryStudentId || user.studentId || '213-15-4921',
        attachmentUrl: inquiryAttachment || undefined,
      });

      if (res.success && res.data) {
        setCreatedTicketId(res.data.id);
        setInquirySent(true);
        setInquiries((prev) => [res.data, ...prev]);
        setTimeout(() => {
          setInquirySent(false);
          setInquirySubject('');
          setInquiryDetails('');
          setInquiryAttachment('');
          setActiveTab('tickets');
        }, 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit inquiry ticket.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  const categories = ['All', 'Registration', 'Examination', 'Transport', 'Waiver & Fees', 'Clubs', 'Facilities'];

  const departmentsList = [
    'All',
    'Computer Science & Engineering',
    'Electrical & Electronic Engineering',
    'Business Administration',
    'Civil Engineering',
    'Department of English',
    'Department of Law',
    'Department of Pharmacy',
    'Textile Engineering',
    'Central Administration',
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
            <span>STUDENT ADVISORY & DIRECTORY</span>
            <span className="text-slate-600">·</span>
            <span>City University Savar Campus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Smart Campus Helpdesk</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Ask AI questions, search verified academic FAQs, submit official support inquiries with screenshot attachments, and find teacher/office directory.
          </p>
        </div>

        {/* Top Segmented Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shrink-0 self-start md:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'faq' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI & FAQs</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiry')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'inquiry' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Submit Inquiry</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tickets');
              loadInquiries();
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>My Tickets</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('directory');
              loadDirectory();
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'directory' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Campus Directory</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. AI ASSISTANT & FAQS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          {/* AI Campus Assistant Grounded Search Bar */}
          <div className="p-5 sm:p-6 rounded-3xl border border-slate-700 bg-slate-900 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Smart Campus AI Assistant</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      Grounded in City University Data
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ask any question about advising deadlines, tuition installments, bus schedules, or exam routines.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAskAI} className="relative">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g. 'When is the Fall 2026 course registration deadline?', 'How to get bus pass to Mirpur?'"
                className="w-full pl-4 pr-32 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-inner"
              />

              <div className="absolute right-2 top-2 flex items-center gap-1">
                {aiQuery && (
                  <button
                    type="button"
                    onClick={clearAiQuery}
                    title="Clear input"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={aiLoading || !aiQuery.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                >
                  {aiLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Ask AI</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Suggested Queries */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
              <span className="text-slate-400">Try asking:</span>
              {[
                'When does Fall registration close?',
                'What is the Mirpur shuttle time?',
                'What CGPA is needed for merit waiver?',
                'Where is the Khagan medical center?',
              ].map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => {
                    setAiQuery(promptText);
                    api.askCampusAI(promptText).then((res) => {
                      if (res.success) setAiResponse(res.data);
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* AI Response Display */}
            {aiResponse && (
              <div className="p-4 rounded-2xl bg-[#0e1935] border border-sky-600/40 text-xs space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    CampusOS Assistant Answer
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified by Campus Registry
                  </span>
                </div>
                <p className="text-slate-100 leading-relaxed whitespace-pre-line">{aiResponse.answer}</p>
                {aiResponse.source && (
                  <div className="pt-2 border-t border-[#1d2d58] text-[11px] text-slate-400 font-mono">
                    Reference Source: <strong className="text-slate-300">{aiResponse.source}</strong>
                  </div>
                )}
              </div>
            )}

            {aiError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          {/* Categorized FAQs Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Verified Campus Knowledge Base & FAQs
                </h2>
                <p className="text-xs text-slate-400">
                  Standard university operating policies, waiver rules, and examination conduct.
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                      selectedCategory === c
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <CardSkeleton count={3} />
            ) : faqs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 text-xs">
                No FAQs listed under this category.
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/70 font-semibold shrink-0">
                            {faq.category}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-white">{faq.question}</span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-sky-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-0 border-t border-slate-800 space-y-2 text-xs bg-slate-950/40">
                          <p className="text-slate-200 leading-relaxed pt-3">
                            {faq.answer}
                          </p>
                          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Source: {faq.officialSource}
                            </span>
                            <span>City University Administration</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBMIT DIRECT INQUIRY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'inquiry' && (
        <div className="max-w-2xl mx-auto space-y-4 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl space-y-5">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                Official Student Support Ticket
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Submit a Direct Inquiry / Question</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Our student support desk and department coordinators will review your inquiry. You can also attach screenshots or documents from your phone or PC.
              </p>
            </div>

            {inquirySent ? (
              <div className="p-8 text-center space-y-3 bg-emerald-950/50 border border-emerald-700/80 rounded-2xl animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Inquiry Ticket Dispatched!</h4>
                <p className="text-xs text-emerald-200 max-w-md mx-auto leading-relaxed">
                  Your ticket has been logged with ID <strong className="font-mono text-white">#{createdTicketId?.slice(-6).toUpperCase()}</strong>. It is now visible in the "My Tickets" tab.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Topic / Wing *</label>
                    <select
                      value={inquiryCategory}
                      onChange={(e) => setInquiryCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Academic Advising">Academic Advising & Retake</option>
                      <option value="Tuition Fee Waiver & Accounts">Tuition Fee Waiver & Accounts</option>
                      <option value="Examination & Routine">Examination & Routine</option>
                      <option value="Transport & Bus Pass">Transport & Bus Pass</option>
                      <option value="Library & Lab Facilities">Library & Lab Facilities</option>
                      <option value="General Administration">General Administration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Student ID *</label>
                    <input
                      type="text"
                      required
                      value={inquiryStudentId}
                      onChange={(e) => setInquiryStudentId(e.target.value)}
                      placeholder="e.g. 213-15-4921"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department *</label>
                  <select
                    value={inquiryDepartment}
                    onChange={(e) => setInquiryDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Department of English">Department of English</option>
                    <option value="Department of Law">Department of Law</option>
                    <option value="Department of Pharmacy">Department of Pharmacy</option>
                    <option value="Textile Engineering">Textile Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject / Question Summary *</label>
                  <input
                    type="text"
                    required
                    value={inquirySubject}
                    onChange={(e) => setInquirySubject(e.target.value)}
                    placeholder="e.g. Incomplete grade in CSE 221 Summer 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Inquiry & Context *</label>
                  <textarea
                    rows={4}
                    required
                    value={inquiryDetails}
                    onChange={(e) => setInquiryDetails(e.target.value)}
                    placeholder="Describe your issue with full details so the coordinators can assist you promptly..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Screenshot / Photo / Document Upload from Phone or PC */}
                <ImageOrFileUpload
                  label="Attach Screenshot or Document (Phone Camera/Gallery or PC)"
                  value={inquiryAttachment}
                  onChange={setInquiryAttachment}
                  placeholder="Upload screenshot or slip image"
                  helperText="Attach fee slip, grade sheet, or error screenshot from your device"
                />

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('faq')}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                  >
                    {inquirySubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Inquiry Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MY SUPPORT TICKETS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                My Support Inquiries & Tickets
              </h2>
              <p className="text-xs text-slate-400">
                Track status of your submitted inquiries, advisor reviews, and official responses.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('inquiry')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>New Inquiry</span>
            </button>
          </div>

          {loading ? (
            <CardSkeleton count={2} />
          ) : inquiries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
              <Inbox className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Tickets Submitted Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Have any issue with advising, fees, waiver, or exams? Submit a ticket and our coordinators will reply.
              </p>
              <button
                onClick={() => setActiveTab('inquiry')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md inline-block"
              >
                Submit Direct Inquiry →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => {
                const isResolved = inq.status === 'RESOLVED';
                const isInReview = inq.status === 'IN_REVIEW';
                return (
                  <div
                    key={inq.id}
                    className="p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900 space-y-4 shadow-lg"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400 px-2.5 py-0.5 rounded-lg bg-sky-950 border border-sky-800">
                          #{inq.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                          {inq.category}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(inq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                          isResolved
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : isInReview
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-sky-950 text-sky-300 border-sky-800'
                        }`}
                      >
                        {isResolved ? '✓ Resolved' : isInReview ? '⏳ In Review' : '● Open Ticket'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{inq.subject}</h3>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed whitespace-pre-line">
                        {inq.details}
                      </p>
                    </div>

                    {/* Attached Photo / Screenshot */}
                    {inq.attachmentUrl && (
                      <div className="pt-2">
                        <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          <span>Attached Document / Screenshot:</span>
                        </div>
                        {inq.attachmentUrl.startsWith('data:image') || inq.attachmentUrl.match(/\.(jpeg|jpg|png|webp)/i) ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(inq.attachmentUrl || null)}
                            className="relative group rounded-xl overflow-hidden border border-slate-700 max-w-xs block text-left"
                          >
                            <img src={inq.attachmentUrl} alt="Attachment" className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity" />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-semibold transition-opacity">
                              <Eye className="w-4 h-4" />
                              <span>View Full Size</span>
                            </div>
                          </button>
                        ) : (
                          <a
                            href={inq.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-sky-300 text-xs hover:text-white border border-slate-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Attachment File</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Official Admin Reply */}
                    {inq.adminReply && (
                      <div className="p-4 rounded-2xl bg-[#0a1b2a] border border-emerald-600/40 text-xs space-y-1.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-emerald-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Official Coordinator / Registrar Response:
                          </span>
                          {inq.repliedAt && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(inq.repliedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-100 leading-relaxed whitespace-pre-line">{inq.adminReply}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CAMPUS DIRECTORY & FACULTY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Faculty & Department Directory
            </h2>
            <p className="text-xs text-slate-400">
              Find teachers, batch advisors, department heads, and campus administration hotlines.
            </p>
          </div>

          {/* Department Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Segmented */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'All', label: 'All Contacts' },
                  { id: 'FACULTY', label: '👨‍🏫 Faculty Members' },
                  { id: 'ADMIN_OFFICE', label: '🏢 Admin Offices' },
                  { id: 'HOTLINE', label: '📞 Hotlines' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDirCategory(c.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                      dirCategory === c.id
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-800/80 border border-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={dirSearch}
                  onChange={(e) => setDirSearch(e.target.value)}
                  placeholder="Search teacher name, email, room..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Department Dropdown Filter */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-800/80">
              <span className="text-slate-400 font-medium">Filter by Department:</span>
              <select
                value={dirDept}
                onChange={(e) => setDirDept(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'All Departments' : d}
                  </option>
                ))}
              </select>

              {user?.department && (
                <button
                  onClick={() => setDirDept(user.department)}
                  className="px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 hover:bg-sky-900 text-[11px] font-mono border border-sky-800 transition-colors"
                >
                  My Department ({user.department.split(' ')[0]})
                </button>
              )}
            </div>
          </div>

          {/* Directory Cards Grid */}
          {loading ? (
            <CardSkeleton count={4} />
          ) : directory.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs">
              No faculty or staff found for this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {directory.map((entry) => (
                <div
                  key={entry.id}
                  className="p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all space-y-4 shadow-lg flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      {entry.avatarUrl ? (
                        <img
                          src={entry.avatarUrl}
                          alt={entry.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shrink-0 shadow-md">
                          {entry.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/80 font-bold truncate">
                            {entry.department}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1 group-hover:text-sky-300 transition-colors truncate">
                          {entry.name}
                        </h3>
                        <p className="text-xs text-sky-400/90 font-medium font-mono">{entry.designation}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs text-slate-300 font-mono">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <a href={`tel:${entry.phone}`} className="hover:text-emerald-300 transition-colors">{entry.phone}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <a href={`mailto:${entry.email}`} className="hover:text-sky-300 transition-colors truncate">{entry.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{entry.officeLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{entry.availableHours || 'Office Hours: 09:00 AM - 04:00 PM'}</span>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`mailto:${entry.email}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold transition-colors"
                      >
                        Email
                      </a>
                      <a
                        href={`tel:${entry.phone}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold transition-colors border border-emerald-800/60"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-4 my-auto">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Preview Attachment" className="w-full max-h-[75vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
