import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  MapPin,
  Calendar,
  CheckCircle2,
  Phone,
  X,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Tag,
  Check,
  Building,
} from 'lucide-react';
import { api } from '../../lib/api';
import { LostFoundItem } from '../../types';
import { CardSkeleton } from '../common/SkeletonLoader';
import { ImageOrFileUpload } from '../common/ImageOrFileUpload';
import { useAuth } from '../../context/AuthContext';

export const LostFoundModule: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'report'>('feed');
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'All' | 'LOST' | 'FOUND'>('All');
  const [search, setSearch] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form states
  const [formType, setFormType] = useState<'LOST' | 'FOUND'>('LOST');
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<'ID Card' | 'Electronics' | 'Documents' | 'Accessories' | 'Other'>('ID Card');
  const [formDescription, setFormDescription] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formImage, setFormImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadItems();
  }, [typeFilter]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await api.getLostFound({
        type: typeFilter !== 'All' ? typeFilter : undefined,
      });
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!formTitle || !formLocation) return;

    try {
      setSubmitting(true);
      const res = await api.createLostFound({
        type: formType,
        title: formTitle.trim(),
        location: formLocation.trim(),
        date: formDate,
        category: formCategory,
        description: formDescription.trim(),
        contactMethod: formContact.trim() || 'Inquire at campus security desk',
        imageUrl: formImage || undefined,
      });

      if (res.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setFormTitle('');
          setFormLocation('');
          setFormDescription('');
          setFormContact('');
          setFormImage('');
          setActiveTab('feed');
          loadItems();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await api.resolveLostFound(id);
      if (res.success) {
        setItems((prev) => prev.map((item) => (item.id === id ? res.data : item)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
            <span>CAMPUS UTILITIES & LOST RECOVERY</span>
            <span className="text-slate-600">·</span>
            <span>Security Desk Coordinated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Lost & Found Community Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Lost or found student ID cards, calculators, chargers, or books around Permanent Campus? Report or locate them with photos.
          </p>
        </div>

        {/* Top Segmented Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shrink-0 self-start sm:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'feed' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Community Feed ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'report' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Item</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. COMMUNITY FEED TAB */}
      {/* ========================================================================= */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
              {(['All', 'LOST', 'FOUND'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    typeFilter === t
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'All' ? 'All Reports' : t === 'LOST' ? '🔍 Lost Items' : '📦 Found Items'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID card, calculator, location..."
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
              />
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <CardSkeleton count={4} />
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No items reported under this filter</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Everything seems accounted for. If you found or lost property on campus, report it with photos.
              </p>
              <button
                onClick={() => setActiveTab('report')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md inline-block"
              >
                Report Lost or Found Item →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all space-y-4 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                            item.type === 'LOST'
                              ? 'bg-rose-950 text-rose-400 border-rose-800/80'
                              : 'bg-emerald-950 text-emerald-400 border-emerald-800/80'
                          }`}
                        >
                          {item.type === 'LOST' ? 'LOST PROPERTY' : 'FOUND ON CAMPUS'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.category}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg ${
                          item.status === 'RESOLVED'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {item.status === 'RESOLVED' ? '✓ RECOVERED / RESOLVED' : 'ACTIVE INQUIRY'}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      {/* Photo Thumbnail if uploaded */}
                      {item.imageUrl && (
                        <div
                          onClick={() => setPreviewImage(item.imageUrl!)}
                          className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0 cursor-pointer group/img relative shadow-md"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 font-mono pt-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Reported on: {item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-sky-400 font-mono">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="truncate max-w-xs">{item.contactMethod}</span>
                    </div>

                    {item.status === 'OPEN' && user && (
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-800 transition-colors text-[11px] font-semibold"
                      >
                        Mark Recovered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REPORT ITEM TAB */}
      {/* ========================================================================= */}
      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto space-y-4 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl space-y-5">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                Campus Security & Lost Recovery
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Report a Lost or Found Item</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide details and attach a photo directly from your phone camera or PC file picker.
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-950/50 border border-emerald-700/80 rounded-2xl animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Item Report Submitted!</h4>
                <p className="text-xs text-emerald-200 max-w-md mx-auto leading-relaxed">
                  Your report has been broadcast to the community desk and logged for security verification.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Type toggle: Lost vs Found */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-800 rounded-2xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setFormType('LOST')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      formType === 'LOST'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🔍 I Lost Something
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('FOUND')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      formType === 'FOUND'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📦 I Found Something
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Item Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Blue Casio fx-991EX Calculator with Name Tag"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ID Card">Student ID Card / Admit</option>
                      <option value="Electronics">Electronics (Calculator, Charger, Phone)</option>
                      <option value="Documents">Books / Notebooks / Documents</option>
                      <option value="Accessories">Accessories / Watch / Keys</option>
                      <option value="Other">Other Miscellaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Campus Location / Room *</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Academic Bldg 1, Room 304 or Central Cafeteria"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Photo Upload from Phone / PC */}
                <ImageOrFileUpload
                  label="Item Photo (Upload from Phone Camera / PC)"
                  value={formImage}
                  onChange={setFormImage}
                  isImageOnly={true}
                  placeholder="Upload photo from your phone or PC"
                  helperText="Take a quick camera photo or select image from gallery"
                />

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description / Identifying Marks</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Any scratches, stickers, color, or specific identifying details..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact / Handover Instructions</label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="e.g. Phone 01700-112233 or Deposited at Main Gate Security"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('feed')}
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
                        <Check className="w-4 h-4" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Full-size Photo Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-950/80 text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Full preview" className="w-full h-auto max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
