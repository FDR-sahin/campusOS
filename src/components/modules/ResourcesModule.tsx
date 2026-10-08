import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Download,
  ExternalLink,
  Bookmark,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  UploadCloud,
  Layers,
  Sparkles,
  Filter,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../../lib/api';
import { ResourceItem } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { CardSkeleton } from '../common/SkeletonLoader';
import { ImageOrFileUpload } from '../common/ImageOrFileUpload';
import { useAuth } from '../../context/AuthContext';

export const ResourcesModule: React.FC = () => {
  const { user, refreshUser, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'vault' | 'upload' | 'saved'>('vault');
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [search, setSearch] = useState('');

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Upload form state
  const [formTitle, setFormTitle] = useState('');
  const [formDept, setFormDept] = useState('Computer Science & Engineering');
  const [formBatch, setFormBatch] = useState('All Batches');
  const [formSection, setFormSection] = useState('All Sections');
  const [formCourse, setFormCourse] = useState('');
  const [formCourseCode, setFormCourseCode] = useState('');
  const [formCategory, setFormCategory] = useState<'Notes' | 'Past Questions' | 'Lab Manual' | 'Syllabus' | 'Lecture Slides'>('Notes');
  const [formUrl, setFormUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadResources();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedDept, selectedCategory, selectedBatch, selectedSection, search]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const res = await api.getResources({
        department: selectedDept !== 'All' ? selectedDept : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        batch: selectedBatch !== 'All' ? selectedBatch : undefined,
        section: selectedSection !== 'All' ? selectedSection : undefined,
        search: search.trim() ? search.trim() : undefined,
      });
      if (res.success) {
        setResources(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  const isImageResource = (url: string) => {
    return (
      url &&
      (url.startsWith('data:image') ||
        url.match(/\.(jpeg|jpg|gif|png|webp)/i) ||
        url.includes('images.unsplash.com'))
    );
  };

  const handleDownload = async (item: ResourceItem) => {
    try {
      const res = await api.recordDownload(item.id);
      if (res.success) {
        setResources((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, downloadCount: res.downloadCount } : r))
        );
      }
    } catch {
      // ignore
    }

    if (item.resourceUrl.startsWith('data:')) {
      // Robust Base64 to Blob conversion
      try {
        const parts = item.resourceUrl.split(';base64,');
        const contentType = parts[0].replace('data:', '') || 'application/octet-stream';
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: contentType });

        let ext = 'pdf';
        if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
        else if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('webp')) ext = 'webp';
        else if (contentType.includes('word') || contentType.includes('docx')) ext = 'docx';
        else if (contentType.includes('pdf')) ext = 'pdf';

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${item.courseCode || 'CU'}_${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch {
        const link = document.createElement('a');
        link.href = item.resourceUrl;
        link.download = `${item.courseCode || 'CU'}_${item.title.replace(/\s+/g, '_')}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      window.open(item.resourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenOnline = (item: ResourceItem) => {
    if (isImageResource(item.resourceUrl)) {
      setPreviewImage(item.resourceUrl);
      return;
    }

    if (item.resourceUrl.startsWith('data:application/pdf')) {
      try {
        const parts = item.resourceUrl.split(';base64,');
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        return;
      } catch {
        // fallback to download
      }
    }

    if (item.resourceUrl.startsWith('data:')) {
      handleDownload(item);
    } else {
      window.open(item.resourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleToggleSave = async (id: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      await api.toggleSaveResource(id);
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCourse || !formUrl) {
      alert('Please fill in title, course name, and attach a file or URL.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createResource({
        title: formTitle.trim(),
        description: formDescription.trim() || 'Uploaded study material for City University students.',
        department: formDept,
        batch: formBatch,
        section: formSection,
        course: formCourse.trim(),
        courseCode: formCourseCode.trim().toUpperCase() || 'GEN 100',
        category: formCategory,
        resourceUrl: formUrl,
      });

      if (res.success) {
        setResources((prev) => [res.data, ...prev]);
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setFormTitle('');
          setFormCourse('');
          setFormCourseCode('');
          setFormBatch('All Batches');
          setFormSection('All Sections');
          setFormUrl('');
          setFormDescription('');
          setActiveTab('vault');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

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
  const categories = ['All', 'Notes', 'Past Questions', 'Lab Manual', 'Syllabus', 'Lecture Slides'];
  const batches = ['All', '66', '65', '64', '63', '62', '61', '60', '59', '58'];
  const sections = ['All', 'A', 'B', 'C', 'D', 'E'];

  const bookmarkedResources = resources.filter((r) => user?.savedResources?.includes(r.id));

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
            <span>STUDENT ACADEMIC REPOSITORY</span>
            <span className="text-slate-600">·</span>
            <span>Study Materials & Question Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Academic Resource Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Verified course slides, past trimester questions, and laboratory manuals uploaded directly by students and faculty.
          </p>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shrink-0 self-start sm:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'vault' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Vault ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'upload' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Material</span>
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'saved' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({bookmarkedResources.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. RESOURCE VAULT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Segmented Pills */}
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

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search CSE 311, DBMS, past questions..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
                />
              </form>
            </div>

            {/* Department, Batch, Section Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
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

          {/* Resources Grid */}
          {loading ? (
            <CardSkeleton count={4} />
          ) : resources.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No materials found in vault</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No notes or questions uploaded under this filter yet. Be the first to upload lecture slides or exam questions!
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md inline-block"
              >
                Upload Course Notes →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((item) => {
                const isSaved = user?.savedResources?.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-400 px-2.5 py-0.5 rounded-lg bg-sky-950 border border-sky-800/80">
                            {item.courseCode}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {item.category}
                          </span>
                          {item.batch && item.batch !== 'All Batches' && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 font-mono text-[10px] border border-sky-800/50">
                              Batch {item.batch}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleToggleSave(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSaved
                              ? 'text-amber-400 bg-amber-950/60 border border-amber-800/60'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title={isSaved ? 'Remove Bookmark' : 'Bookmark Material'}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-sky-400/90 font-medium mt-0.5">{item.course}</p>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {/* Image Thumbnail / Note Preview if resource is an image */}
                      {isImageResource(item.resourceUrl) && (
                        <div
                          onClick={() => setPreviewImage(item.resourceUrl)}
                          className="relative h-28 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 cursor-pointer group/thumb shadow-inner"
                        >
                          <img
                            src={item.resourceUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-semibold transition-opacity">
                            <Eye className="w-4 h-4" />
                            <span>Click to Zoom Note</span>
                          </div>
                        </div>
                      )}

                      <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>Dept: {item.department.split(' ')[0]}</span>
                        <span>·</span>
                        <span>Uploader: {item.uploadedBy || 'Faculty / CR'}</span>
                        <span>·</span>
                        <span>{item.downloadCount} Downloads</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        Verified City University Resource
                      </span>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => handleOpenOnline(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isImageResource(item.resourceUrl) ? 'Zoom' : 'Open'}</span>
                        </button>

                        <button
                          onClick={() => handleDownload(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. UPLOAD / CONTRIBUTE MATERIAL TAB */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl mx-auto space-y-4 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl space-y-5">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                Contribute to Student Community
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Upload Study Material & Questions</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload PDFs, lecture slides, lab manuals, or past question photos directly from your phone or PC.
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-950/50 border border-emerald-700/80 rounded-2xl animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Resource Published Successfully!</h4>
                <p className="text-xs text-emerald-200 max-w-md mx-auto leading-relaxed">
                  Your academic document has been cataloged into the Resource Vault and is now accessible to all students.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateResource} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. CSE 311 Final Term Review Notes & ER Diagrams"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Course Name *</label>
                    <input
                      type="text"
                      required
                      value={formCourse}
                      onChange={(e) => setFormCourse(e.target.value)}
                      placeholder="e.g. Database Management Systems"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Course Code *</label>
                    <input
                      type="text"
                      required
                      value={formCourseCode}
                      onChange={(e) => setFormCourseCode(e.target.value)}
                      placeholder="e.g. CSE 311"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Material Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Notes">Handwritten / Typed Notes</option>
                      <option value="Past Questions">Past Trimester Questions</option>
                      <option value="Lecture Slides">Official Lecture Slides</option>
                      <option value="Lab Manual">Lab Manual & Code Sheet</option>
                      <option value="Syllabus">Course Syllabus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Target Batch</label>
                    <input
                      type="text"
                      value={formBatch}
                      onChange={(e) => setFormBatch(e.target.value)}
                      placeholder="All Batches or 65"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Target Section</label>
                    <input
                      type="text"
                      value={formSection}
                      onChange={(e) => setFormSection(e.target.value)}
                      placeholder="All Sections or B"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Direct File Attachment from Phone / PC */}
                <ImageOrFileUpload
                  label="Attach Study File (PDF, DOCX, PPTX, or Image Note) *"
                  value={formUrl}
                  onChange={setFormUrl}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                  placeholder="https://drive.google.com/... or choose file"
                  helperText="Upload files directly from your phone gallery/documents or PC file explorer"
                />

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Brief Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide overview of chapters, topics covered, or mid/final preparation tips..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('vault')}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Publish Study Resource</span>
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
      {/* 3. SAVED / BOOKMARKED NOTES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'saved' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              My Bookmarked Study Materials
            </h2>
            <p className="text-xs text-slate-400">
              Your personal library of saved lecture notes and exam solution files.
            </p>
          </div>

          {bookmarkedResources.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
              <Bookmark className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No bookmarked materials</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Bookmark notes and past questions from the vault to access them quickly offline or before exams.
              </p>
              <button
                onClick={() => setActiveTab('vault')}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-md inline-block"
              >
                Browse Resource Vault →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedResources.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl border border-slate-700 bg-slate-900/80 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-lg bg-amber-950 border border-amber-800/80">
                        {item.courseCode}
                      </span>
                      <button
                        onClick={() => handleToggleSave(item.id)}
                        className="text-amber-400 hover:text-rose-400 text-xs font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400">{item.department}</span>
                    <button
                      onClick={() => handleDownload(item)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
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
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-4 my-auto">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Preview Resource" className="w-full max-h-[78vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
