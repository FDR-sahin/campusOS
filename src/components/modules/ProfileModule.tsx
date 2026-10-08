import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Bookmark,
  Calendar,
  BookOpen,
  Clock,
  ShieldCheck,
  Mail,
  Hash,
  Building,
  Camera,
  Edit3,
  CheckCircle2,
  X,
  Loader2,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Notice, Exam, EventItem, ResourceItem } from '../../types';
import { ImageOrFileUpload } from '../common/ImageOrFileUpload';

export const ProfileModule: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [savedNotices, setSavedNotices] = useState<Notice[]>([]);
  const [savedExams, setSavedExams] = useState<Exam[]>([]);
  const [savedResources, setSavedResources] = useState<ResourceItem[]>([]);
  const [rsvpedEvents, setRsvpedEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editSection, setEditSection] = useState('');
  const [editDept, setEditDept] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditAvatar(user.avatarUrl || '');
      setEditStudentId(user.studentId || '');
      setEditBatch(user.batch || '');
      setEditSection(user.section || '');
      setEditDept(user.department || '');
    }
  }, [user]);

  useEffect(() => {
    async function loadSavedData() {
      if (!user) return;
      try {
        setLoading(true);
        const [noticesRes, examsRes, resourcesRes, eventsRes] = await Promise.all([
          api.getNotices(),
          api.getExams(),
          api.getResources(),
          api.getEvents(),
        ]);

        if (noticesRes.success) {
          setSavedNotices(noticesRes.data.filter((n) => user.savedNotices?.includes(n.id)));
        }
        if (examsRes.success) {
          setSavedExams(examsRes.data.filter((e) => user.savedExams?.includes(e.id)));
        }
        if (resourcesRes.success) {
          setSavedResources(resourcesRes.data.filter((r) => user.savedResources?.includes(r.id)));
        }
        if (eventsRes.success) {
          setRsvpedEvents(eventsRes.data.filter((ev) => ev.attendees?.includes(user.id)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSavedData();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        name: editName.trim(),
        avatarUrl: editAvatar,
        studentId: editStudentId.trim(),
        batch: editBatch.trim(),
        section: editSection.trim(),
        department: editDept,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="p-12 text-center text-slate-400">
        Please sign in to view your profile and saved items.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Student Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-700 bg-slate-900 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500 shadow-xl shadow-sky-500/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-2xl shadow-xl shadow-sky-500/20">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white shadow-md transition-transform hover:scale-110"
                title="Change Avatar / Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white">{user.name}</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  {user.role}
                </span>
                {user.batch && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Batch {user.batch} {user.section ? `· Sec ${user.section}` : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">{user.department}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-sky-400 hover:text-sky-300 font-medium transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                Edit Profile & Avatar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <div className="text-slate-400 text-[10px]">Student ID</div>
              <div className="font-bold text-white mt-0.5">{user.studentId || '213-15-4921'}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <div className="text-slate-400 text-[10px]">Batch & Sec</div>
              <div className="font-bold text-amber-400 mt-0.5">{user.batch ? `Batch ${user.batch} (${user.section || 'All'})` : 'Batch 65-B'}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <div className="text-slate-400 text-[10px]">Trimester</div>
              <div className="font-bold text-sky-400 mt-0.5">Fall 2026</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <div className="text-slate-400 text-[10px]">Campus</div>
              <div className="font-bold text-emerald-400 mt-0.5">Khagan Main</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white">Edit Student Profile & Photo</h3>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Profile and avatar updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo Upload from Phone / PC */}
              <ImageOrFileUpload
                label="Profile Picture / Avatar (Phone Camera/Gallery or PC Explorer)"
                value={editAvatar}
                onChange={setEditAvatar}
                accept="image/*"
                isImageOnly={true}
                placeholder="Upload your photo from camera/gallery/PC or paste image link"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={editStudentId}
                    onChange={(e) => setEditStudentId(e.target.value)}
                    placeholder="e.g. 213-15-4921"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Academic Department</label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering (EEE)</option>
                  <option value="Business Administration">Business Administration (BBA)</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Department of English">Department of English</option>
                  <option value="Department of Law">Department of Law</option>
                  <option value="Department of Pharmacy">Department of Pharmacy</option>
                  <option value="Textile Engineering">Textile Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    placeholder="e.g. 65"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Section</label>
                  <input
                    type="text"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    placeholder="e.g. B or 65_B"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saved Hub Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookmarked Exams */}
        <section className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                My Saved Exams ({savedExams.length})
              </h2>
            </div>
          </div>

          {savedExams.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No exam routines saved yet. Bookmark exams from the Exams tab.</p>
          ) : (
            <div className="space-y-2.5">
              {savedExams.map((exam) => (
                <div key={exam.id} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-400">{exam.courseCode}</span>
                    <span className="font-mono text-emerald-400">{exam.date}</span>
                  </div>
                  <div className="text-white font-medium">{exam.course}</div>
                  <div className="text-slate-300 font-mono text-[11px]">{exam.time} · {exam.location}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RSVP'd Events */}
        <section className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                My RSVP'd Events ({rsvpedEvents.length})
              </h2>
            </div>
          </div>

          {rsvpedEvents.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">You have not RSVP'd to any events yet.</p>
          ) : (
            <div className="space-y-2.5">
              {rsvpedEvents.map((evt) => (
                <div key={evt.id} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sky-400">{evt.club}</span>
                    <span className="font-mono text-slate-400">{evt.date}</span>
                  </div>
                  <div className="text-white font-medium">{evt.title}</div>
                  <div className="text-slate-300 font-mono text-[11px]">📍 {evt.location}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Study Materials */}
        <section className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Saved Resources ({savedResources.length})
              </h2>
            </div>
          </div>

          {savedResources.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No study materials bookmarked yet.</p>
          ) : (
            <div className="space-y-2.5">
              {savedResources.map((res) => (
                <div key={res.id} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-400">{res.courseCode}</span>
                    <span className="text-slate-300">{res.category}</span>
                  </div>
                  <div className="text-white font-medium line-clamp-1">{res.title}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Notices */}
        <section className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Bookmarked Notices ({savedNotices.length})
              </h2>
            </div>
          </div>

          {savedNotices.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No notices bookmarked yet.</p>
          ) : (
            <div className="space-y-2.5">
              {savedNotices.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-400 font-semibold">{n.category}</span>
                    <span className="font-mono text-slate-400">{n.publishedAt}</span>
                  </div>
                  <div className="text-white font-medium line-clamp-1">{n.title}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
