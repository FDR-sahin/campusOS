import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Clock,
  Calendar,
  BookOpen,
  Bus,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ShieldAlert,
  Loader2,
  ExternalLink,
  MapPin,
  Phone,
  Users,
  Camera,
  QrCode,
  Ticket,
  Video,
  UserCheck,
  GraduationCap,
  MessageSquare,
  Mail,
  PhoneCall,
  FileText,
  Search,
  Building2,
  UserPlus,
  Send,
  Edit3,
  ZoomIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { AdminAttendeesModal } from '../events/AdminAttendeesModal';
import { ImageOrFileUpload } from '../common/ImageOrFileUpload';
import {
  Notice,
  Exam,
  EventItem,
  ResourceItem,
  BusSchedule,
  DashboardStats,
  DirectoryContact,
  HelpdeskInquiry,
} from '../../types';

export const AdminPortal: React.FC = () => {
  const { user, isAdmin, openAuthModal } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'notices' | 'exams' | 'events' | 'resources' | 'transport' | 'directory' | 'inquiries'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [buses, setBuses] = useState<BusSchedule[]>([]);
  const [directory, setDirectory] = useState<DirectoryContact[]>([]);
  const [inquiries, setInquiries] = useState<HelpdeskInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Global action notification toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // 1. Notice Modal State
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDesc, setNoticeDesc] = useState('');
  const [noticeCat, setNoticeCat] = useState<'Academic' | 'Examination' | 'Transport' | 'Scholarship' | 'Holiday' | 'General'>('Academic');
  const [noticeDept, setNoticeDept] = useState('All Departments');
  const [noticeBatch, setNoticeBatch] = useState('All Batches');
  const [noticeSection, setNoticeSection] = useState('All Sections');
  const [noticeDeadline, setNoticeDeadline] = useState('');
  const [noticePriority, setNoticePriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [noticeSource, setNoticeSource] = useState('https://cityuniversity.ac.bd/notices');

  // 2. Exam Modal State
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [examCourse, setExamCourse] = useState('');
  const [examCode, setExamCode] = useState('');
  const [examDept, setExamDept] = useState('Computer Science & Engineering');
  const [examBatch, setExamBatch] = useState('65');
  const [examSection, setExamSection] = useState('B');
  const [examType, setExamType] = useState<'Midterm' | 'Final' | 'Quiz'>('Final');
  const [examDate, setExamDate] = useState('2026-10-24');
  const [examTime, setExamTime] = useState('10:00 AM - 12:00 PM');
  const [examLocation, setExamLocation] = useState('Academic Bldg 1, Room 304, Khagan Campus');

  // 3. Event Modal State & Attendee Management
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedAdminEvent, setSelectedAdminEvent] = useState<EventItem | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventClub, setEventClub] = useState('CPCCU (Competitive Programming Community)');
  const [eventDept, setEventDept] = useState('All Departments');
  const [eventBatch, setEventBatch] = useState('All Batches');
  const [eventSection, setEventSection] = useState('All Sections');
  const [eventDate, setEventDate] = useState('2026-10-30');
  const [eventTime, setEventTime] = useState('10:00 AM - 04:00 PM');
  const [eventLocation, setEventLocation] = useState('Khagan Permanent Campus Auditorium');
  const [eventFormat, setEventFormat] = useState<'PHYSICAL' | 'ONLINE' | 'HYBRID'>('PHYSICAL');
  const [eventMeetingUrl, setEventMeetingUrl] = useState('');
  const [eventMaxCapacity, setEventMaxCapacity] = useState('200');
  const [eventDeadline, setEventDeadline] = useState('');
  const [eventBanner, setEventBanner] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  // 4. Resource Modal State
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resDept, setResDept] = useState('Computer Science & Engineering');
  const [resBatch, setResBatch] = useState('All Batches');
  const [resSection, setResSection] = useState('All Sections');
  const [resCourse, setResCourse] = useState('');
  const [resCode, setResCode] = useState('CSE 311');
  const [resCategory, setResCategory] = useState<'Notes' | 'Past Questions' | 'Lab Manual' | 'Syllabus' | 'Lecture Slides'>('Notes');
  const [resUrl, setResUrl] = useState('');
  const [resDesc, setResDesc] = useState('');

  // 5. Bus Schedule Modal State
  const [busModalOpen, setBusModalOpen] = useState(false);
  const [busRoute, setBusRoute] = useState('');
  const [busNumber, setBusNumber] = useState('Bus #09');
  const [busDeparturePoint, setBusDeparturePoint] = useState('Mirpur-10 Roundabout');
  const [busDestination, setBusDestination] = useState('City University Khagan Campus');
  const [busDepartureTime, setBusDepartureTime] = useState('07:30 AM');
  const [busReturnTime, setBusReturnTime] = useState('04:30 PM');
  const [busDriverPhone, setBusDriverPhone] = useState('01711-000000');

  // 6. Campus Directory Modal State & Filtering
  const [directoryModalOpen, setDirectoryModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [dirName, setDirName] = useState('');
  const [dirDesignation, setDirDesignation] = useState('Assistant Professor');
  const [dirDepartment, setDirDepartment] = useState('Computer Science & Engineering');
  const [dirCategory, setDirCategory] = useState<'FACULTY' | 'ADMIN_OFFICE' | 'HOTLINE'>('FACULTY');
  const [dirEmail, setDirEmail] = useState('');
  const [dirPhone, setDirPhone] = useState('');
  const [dirOfficeLocation, setDirOfficeLocation] = useState('Academic Bldg 1, Room 302, Khagan Campus');
  const [dirAvailableHours, setDirAvailableHours] = useState('Sun - Thu: 10:00 AM - 04:00 PM');
  const [dirAvatarUrl, setDirAvatarUrl] = useState('');
  const [dirSearchQuery, setDirSearchQuery] = useState('');
  const [dirSelectedDept, setDirSelectedDept] = useState('ALL');

  // 7. Helpdesk Tickets & Inquiry Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<HelpdeskInquiry | null>(null);
  const [replyStatus, setReplyStatus] = useState<'OPEN' | 'IN_REVIEW' | 'RESOLVED'>('RESOLVED');
  const [replyText, setReplyText] = useState('');
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState<'ALL' | 'OPEN' | 'IN_REVIEW' | 'RESOLVED'>('ALL');
  const [inquiryImageZoom, setInquiryImageZoom] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const [sRes, nRes, exRes, evRes, rRes, bRes, dRes, iRes] = await Promise.all([
        api.getDashboardStats(),
        api.getNotices(),
        api.getExams(),
        api.getEvents(),
        api.getResources(),
        api.getBusSchedules(),
        api.getDirectory(),
        api.getHelpdeskInquiries(),
      ]);

      if (sRes.success) setStats(sRes.data);
      if (nRes.success) setNotices(nRes.data);
      if (exRes.success) setExams(exRes.data);
      if (evRes.success) setEvents(evRes.data);
      if (rRes.success) setResources(rRes.data);
      if (bRes.success) setBuses(bRes.data);
      if (dRes.success) setDirectory(dRes.data);
      if (iRes.success) setInquiries(iRes.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. CREATE NOTICE
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);
    try {
      const res = await api.createNotice({
        title: noticeTitle.trim(),
        description: noticeDesc.trim(),
        category: noticeCat,
        department: noticeDept,
        batch: noticeBatch,
        section: noticeSection,
        deadline: noticeDeadline || undefined,
        priority: noticePriority,
        sourceUrl: noticeSource,
        verified: true,
      });

      if (res.success && res.data) {
        setNotices((prev) => [res.data, ...prev]);
        setNoticeModalOpen(false);
        setNoticeTitle('');
        setNoticeDesc('');
        setNoticeDeadline('');
        notify('success', `Notice "${res.data.title}" successfully published to CampusOS!`);
        await loadAll();
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to publish notice. Check permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      notify('success', 'Notice deleted successfully.');
      loadAll();
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete notice.');
    }
  };

  // 2. CREATE EXAM
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);
    try {
      const res = await api.createExam({
        course: examCourse.trim(),
        courseCode: examCode.trim().toUpperCase(),
        department: examDept,
        examType,
        date: examDate,
        time: examTime,
        location: examLocation,
        verified: true,
      });

      if (res.success && res.data) {
        setExams((prev) => [...prev, res.data]);
        setExamModalOpen(false);
        setExamCourse('');
        setExamCode('');
        notify('success', `Exam schedule for ${res.data.courseCode} added successfully!`);
        await loadAll();
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to add exam routine.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Delete this exam entry?')) return;
    try {
      await api.deleteExam(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
      notify('success', 'Exam routine item deleted.');
      loadAll();
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete exam item.');
    }
  };

  // 3. CREATE EVENT
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);
    try {
      const res = await api.createEvent({
        title: eventTitle.trim(),
        club: eventClub,
        department: eventDept,
        batch: eventBatch,
        section: eventSection,
        host: 'Department / Club Office',
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        description: eventDesc.trim(),
        eventType: eventFormat,
        onlineMeetingUrl: eventMeetingUrl.trim() || undefined,
        maxCapacity: eventMaxCapacity ? parseInt(eventMaxCapacity, 10) : undefined,
        registrationDeadline: eventDeadline || undefined,
        bannerImage: eventBanner || undefined,
        verified: true,
      });

      if (res.success && res.data) {
        setEvents((prev) => [...prev, res.data]);
        setEventModalOpen(false);
        setEventTitle('');
        setEventDesc('');
        setEventMeetingUrl('');
        setEventBanner('');
        notify('success', `Campus event "${res.data.title}" successfully published!`);
        await loadAll();
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to publish event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      notify('success', 'Campus event removed.');
      loadAll();
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete event.');
    }
  };

  // 4. CREATE STUDY RESOURCE
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);
    try {
      const res = await api.createResource({
        title: resTitle.trim(),
        description: resDesc.trim() || 'Official material published by administration.',
        department: resDept,
        course: resCourse.trim(),
        courseCode: resCode.trim().toUpperCase(),
        category: resCategory,
        resourceUrl: resUrl.trim(),
      });

      if (res.success && res.data) {
        setResources((prev) => [res.data, ...prev]);
        setResourceModalOpen(false);
        setResTitle('');
        setResCourse('');
        setResUrl('');
        setResDesc('');
        notify('success', `Resource "${res.data.title}" successfully added!`);
        await loadAll();
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to add study material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Remove this resource?')) return;
    try {
      await api.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      notify('success', 'Study resource removed.');
      loadAll();
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete resource.');
    }
  };

  // 5. CREATE BUS SCHEDULE
  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);
    try {
      const res = await api.createBusSchedule({
        routeName: busRoute.trim(),
        routeNumber: busNumber.trim() || 'CU-09',
        departurePoint: busDeparturePoint.trim(),
        destination: busDestination.trim(),
        morningDepTime: busDepartureTime.trim(),
        returnDepTime: busReturnTime.trim(),
        viaPoints: [busDeparturePoint, 'Ashulia Road', 'Khagan Campus'],
        status: 'Normal',
        contactPerson: busDriverPhone.trim() || 'Transport Desk',
      });

      if (res.success && res.data) {
        setBuses((prev) => [...prev, res.data]);
        setBusModalOpen(false);
        setBusRoute('');
        notify('success', `Bus schedule for ${res.data.routeName} added!`);
        await loadAll();
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to add shuttle schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (!confirm('Remove this bus routine?')) return;
    try {
      await api.deleteBusSchedule(id);
      setBuses((prev) => prev.filter((b) => b.id !== id));
      notify('success', 'Bus routine removed.');
      loadAll();
    } catch (err: any) {
      notify('error', err.message || 'Failed to remove bus routine.');
    }
  };

  // 6. DIRECTORY HANDLERS
  const resetDirForm = () => {
    setDirName('');
    setDirDesignation('Assistant Professor');
    setDirDepartment('Computer Science & Engineering');
    setDirCategory('FACULTY');
    setDirEmail('');
    setDirPhone('');
    setDirOfficeLocation('Academic Bldg 1, Room 302, Khagan Campus');
    setDirAvailableHours('Sun - Thu: 10:00 AM - 04:00 PM');
    setDirAvatarUrl('');
    setEditingContactId(null);
  };

  const openAddDirectoryModal = () => {
    resetDirForm();
    setModalError(null);
    setDirectoryModalOpen(true);
  };

  const openEditDirectoryModal = (contact: DirectoryContact) => {
    setEditingContactId(contact.id);
    setDirName(contact.name);
    setDirDesignation(contact.designation);
    setDirDepartment(contact.department);
    setDirCategory(contact.category);
    setDirEmail(contact.email);
    setDirPhone(contact.phone);
    setDirOfficeLocation(contact.officeLocation);
    setDirAvailableHours(contact.availableHours || 'Sun - Thu: 10:00 AM - 04:00 PM');
    setDirAvatarUrl(contact.avatarUrl || '');
    setModalError(null);
    setDirectoryModalOpen(true);
  };

  const handleSaveDirectoryContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);
    try {
      if (editingContactId) {
        const res = await api.updateDirectoryContact(editingContactId, {
          name: dirName.trim(),
          designation: dirDesignation.trim(),
          department: dirDepartment,
          category: dirCategory,
          email: dirEmail.trim(),
          phone: dirPhone.trim(),
          officeLocation: dirOfficeLocation.trim(),
          availableHours: dirAvailableHours.trim() || undefined,
          avatarUrl: dirAvatarUrl || undefined,
        });
        if (res.success && res.data) {
          setDirectory((prev) => prev.map((c) => (c.id === editingContactId ? res.data : c)));
          notify('success', `Faculty contact "${res.data.name}" updated!`);
        }
      } else {
        const res = await api.createDirectoryContact({
          name: dirName.trim(),
          designation: dirDesignation.trim(),
          department: dirDepartment,
          category: dirCategory,
          email: dirEmail.trim(),
          phone: dirPhone.trim(),
          officeLocation: dirOfficeLocation.trim(),
          availableHours: dirAvailableHours.trim() || undefined,
          avatarUrl: dirAvatarUrl || undefined,
        });
        if (res.success && res.data) {
          setDirectory((prev) => [res.data, ...prev]);
          notify('success', `Faculty contact "${res.data.name}" added to Campus Directory!`);
        }
      }
      setDirectoryModalOpen(false);
      resetDirForm();
      loadAll();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save directory contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDirectoryContact = async (id: string) => {
    if (!confirm('Remove this person from the campus directory?')) return;
    try {
      await api.deleteDirectoryContact(id);
      setDirectory((prev) => prev.filter((d) => d.id !== id));
      notify('success', 'Faculty removed from directory.');
      loadAll();
    } catch (err: any) {
      notify('error', err.message || 'Failed to remove contact.');
    }
  };

  // 7. HELPDESK INQUIRIES HANDLERS
  const openReplyInquiryModal = (inquiry: HelpdeskInquiry) => {
    setSelectedInquiry(inquiry);
    setReplyStatus(inquiry.status === 'OPEN' ? 'IN_REVIEW' : inquiry.status);
    setReplyText(inquiry.adminReply || '');
    setModalError(null);
    setReplyModalOpen(true);
  };

  const handleReplyInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setModalError(null);
    setSubmitting(true);
    try {
      const res = await api.replyHelpdeskInquiry(selectedInquiry.id, {
        status: replyStatus,
        adminReply: replyText.trim(),
      });
      if (res.success && res.data) {
        setInquiries((prev) => prev.map((i) => (i.id === selectedInquiry.id ? res.data : i)));
        setReplyModalOpen(false);
        setSelectedInquiry(null);
        notify('success', `Replied to student ticket #${res.data.id}!`);
        loadAll();
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to update ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Delete this student inquiry ticket?')) return;
    try {
      await api.deleteHelpdeskInquiry(id);
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      notify('success', 'Ticket deleted.');
      loadAll();
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete ticket.');
    }
  };

  // Unauthorized state
  if (!isAdmin) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-2xl border border-amber-900/60 bg-slate-900 max-w-lg mx-auto space-y-4 my-8 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Administrator Access Required</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          The Admin Control Center is reserved for authorized university administration (<span className="text-amber-300 font-medium">sahinfdr89@gmail.com</span>) to curate official notices, publish examination schedules, and manage campus services.
        </p>
        <button
          onClick={openAuthModal}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
        >
          Sign In as Administrator →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Global Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-lg animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
              : 'bg-rose-950/80 border-rose-700 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5 font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span>CAMPUSOS CONTROL CENTER</span>
            <span className="text-slate-600">·</span>
            <span>Signed in as {user?.email}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Administrative Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official publisher for notices, exam routine schedules, events, and campus resources.
          </p>
        </div>

        <button
          onClick={loadAll}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin Subtabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'notices', label: `Notices (${notices.length})`, icon: Sparkles },
          { id: 'exams', label: `Exams (${exams.length})`, icon: Clock },
          { id: 'events', label: `Events (${events.length})`, icon: Calendar },
          { id: 'resources', label: `Resources (${resources.length})`, icon: BookOpen },
          { id: 'transport', label: `Shuttle Bus (${buses.length})`, icon: Bus },
          { id: 'directory', label: `Faculty & Staff (${directory.length})`, icon: Users },
          { id: 'inquiries', label: `Student Tickets (${inquiries.filter(i => i.status !== 'RESOLVED').length} open)`, icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW SECTION */}
      {/* ========================================================================= */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-1 shadow-md">
              <div className="text-[11px] font-mono text-slate-400">Total Users</div>
              <div className="text-2xl font-bold text-white font-mono">{stats?.totalUsers ?? 2}</div>
              <div className="text-[10px] text-emerald-400">Enrolled Students & Staff</div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-1 shadow-md">
              <div className="text-[11px] font-mono text-slate-400">Published Notices</div>
              <div className="text-2xl font-bold text-sky-400 font-mono">{notices.length}</div>
              <div className="text-[10px] text-slate-400">Live on campus feed</div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-1 shadow-md">
              <div className="text-[11px] font-mono text-slate-400">Faculty Members</div>
              <div className="text-2xl font-bold text-purple-400 font-mono">{directory.length}</div>
              <div className="text-[10px] text-slate-400">Across 8 departments</div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-1 shadow-md">
              <div className="text-[11px] font-mono text-slate-400">Pending Inquiries</div>
              <div className="text-2xl font-bold text-rose-400 font-mono">{inquiries.filter(i => i.status !== 'RESOLVED').length}</div>
              <div className="text-[10px] text-slate-400">Awaiting official review</div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Administrative Fast Actions</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setModalError(null);
                  setNoticeModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Official Notice</span>
              </button>
              <button
                onClick={() => {
                  setModalError(null);
                  setExamModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Exam Routine</span>
              </button>
              <button
                onClick={() => {
                  setModalError(null);
                  setEventModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Campus Event</span>
              </button>
              <button
                onClick={() => {
                  setModalError(null);
                  setResourceModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Study Material</span>
              </button>
              <button
                onClick={openAddDirectoryModal}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Faculty Member</span>
              </button>
              <button
                onClick={() => setActiveSection('inquiries')}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Review Student Inquiries ({inquiries.filter(i => i.status !== 'RESOLVED').length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. NOTICES TAB */}
      {/* ========================================================================= */}
      {activeSection === 'notices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Manage Official Notices</h3>
              <p className="text-xs text-slate-400">Total {notices.length} notices published across departments</p>
            </div>
            <button
              onClick={() => {
                setModalError(null);
                setNoticeModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notice</span>
            </button>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-sky-400">{n.category}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{n.department}</span>
                    {n.batch && n.batch !== 'All Batches' && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 font-mono text-[11px] border border-sky-800/40">Batch {n.batch}</span>
                      </>
                    )}
                    {n.section && n.section !== 'All Sections' && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-mono text-[11px] border border-amber-800/40">Sec {n.section}</span>
                    )}
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-slate-500">{n.publishedAt}</span>
                    {n.priority === 'URGENT' && <span className="text-rose-400 font-mono text-[10px] font-bold">URGENT</span>}
                  </div>
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{n.description}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs font-mono text-emerald-400 mr-2">✓ Verified</span>
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EXAMS TAB */}
      {/* ========================================================================= */}
      {activeSection === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Manage Examination Routines</h3>
              <p className="text-xs text-slate-400">Total {exams.length} scheduled exam courses</p>
            </div>
            <button
              onClick={() => {
                setModalError(null);
                setExamModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exam Schedule</span>
            </button>
          </div>

          <div className="space-y-3">
            {exams.map((ex) => (
              <div
                key={ex.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-sky-400">{ex.courseCode}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{ex.department}</span>
                    {ex.batch && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 font-mono text-[11px] border border-sky-800/40">Batch {ex.batch}</span>
                      </>
                    )}
                    {ex.section && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-mono text-[11px] border border-amber-800/40">Sec {ex.section}</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{ex.course} ({ex.examType})</h4>
                  <p className="text-xs text-slate-400 font-mono">{ex.date} · {ex.time} · {ex.location}</p>
                </div>

                <button
                  onClick={() => handleDeleteExam(ex.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors"
                  title="Delete exam"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EVENTS TAB & ATTENDANCE SCANNER */}
      {/* ========================================================================= */}
      {activeSection === 'events' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Manage Campus Events & Attendance</h3>
              <p className="text-xs text-slate-400">Total {events.length} club and university events with QR check-in</p>
            </div>
            <button
              onClick={() => {
                setModalError(null);
                setEventModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-sky-400 font-bold">{ev.club}</span>
                    <span className="text-slate-600">·</span>
                    {ev.eventType && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ev.eventType === 'ONLINE'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : ev.eventType === 'HYBRID'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {ev.eventType === 'ONLINE' ? '🌐 ONLINE' : ev.eventType === 'HYBRID' ? '⚡ HYBRID' : '📍 IN-PERSON'}
                      </span>
                    )}
                    {ev.department && ev.department !== 'All Departments' && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-300">{ev.department}</span>
                      </>
                    )}
                    {ev.batch && ev.batch !== 'All Batches' && (
                      <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 font-mono text-[11px] border border-sky-800/40">
                        Batch {ev.batch}
                      </span>
                    )}
                    {ev.section && ev.section !== 'All Sections' && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-mono text-[11px] border border-amber-800/40">
                        Sec {ev.section}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white leading-snug">{ev.title}</h4>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono pt-0.5">
                    <span className="text-emerald-400 font-semibold">{ev.date} · {ev.time}</span>
                    <span>·</span>
                    <span className="text-slate-300 truncate max-w-xs">{ev.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedAdminEvent(ev)}
                    className="px-3.5 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Attendees ({ev.attendeesCount}) & Scanner</span>
                  </button>

                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RESOURCES TAB */}
      {/* ========================================================================= */}
      {activeSection === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Academic Study Materials Hub</h3>
              <p className="text-xs text-slate-400">Total {resources.length} lecture slides, notes, and question archives</p>
            </div>
            <button
              onClick={() => {
                setModalError(null);
                setResourceModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Material</span>
            </button>
          </div>

          <div className="space-y-3">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-sky-400">{res.courseCode}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{res.category}</span>
                    {res.batch && res.batch !== 'All Batches' && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 font-mono text-[11px] border border-sky-800/40">Batch {res.batch}</span>
                      </>
                    )}
                    {res.section && res.section !== 'All Sections' && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-mono text-[11px] border border-amber-800/40">Sec {res.section}</span>
                    )}
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500">By: {res.uploadedBy}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{res.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">{res.department} · {res.downloadCount} views</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={res.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteResource(res.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors"
                    title="Delete resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SHUTTLE BUS TAB */}
      {/* ========================================================================= */}
      {activeSection === 'transport' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Manage Campus Shuttle Buses</h3>
              <p className="text-xs text-slate-400">Total {buses.length} active routes connecting Dhaka to Permanent Campus</p>
            </div>
            <button
              onClick={() => {
                setModalError(null);
                setBusModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bus Route</span>
            </button>
          </div>

          <div className="space-y-3">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-teal-400">{bus.routeNumber || 'Shuttle'}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{bus.departurePoint} ➔ {bus.destination}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{bus.routeName}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Morning: {bus.morningDepTime} | Return: {bus.returnDepTime} {bus.contactPerson ? `| Contact: ${bus.contactPerson}` : ''}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteBus(bus.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors"
                  title="Remove bus routine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CAMPUS DIRECTORY TAB */}
      {/* ========================================================================= */}
      {activeSection === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Manage Faculty & Campus Directory</h3>
              <p className="text-xs text-slate-400">
                Total {directory.length} teachers and office contacts across all City University departments
              </p>
            </div>
            <button
              onClick={openAddDirectoryModal}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Faculty Member</span>
            </button>
          </div>

          {/* Directory Filters */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={dirSearchQuery}
                onChange={(e) => setDirSearchQuery(e.target.value)}
                placeholder="Search faculty by name, designation, room, email, or phone..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="w-full md:w-64 shrink-0">
              <select
                value={dirSelectedDept}
                onChange={(e) => setDirSelectedDept(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Departments & Offices</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Department of English">Department of English</option>
                <option value="Department of Law">Department of Law</option>
                <option value="Department of Pharmacy">Department of Pharmacy</option>
                <option value="Textile Engineering">Textile Engineering</option>
                <option value="University Administration">University Administration</option>
                <option value="Accounts & Finance">Accounts & Finance</option>
                <option value="Medical Center">Medical Center</option>
              </select>
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {directory
              .filter((c) => {
                const matchesDept = dirSelectedDept === 'ALL' || c.department.toLowerCase().includes(dirSelectedDept.toLowerCase()) || dirSelectedDept.toLowerCase().includes(c.department.toLowerCase());
                const query = dirSearchQuery.toLowerCase().trim();
                const matchesSearch =
                  !query ||
                  c.name.toLowerCase().includes(query) ||
                  c.designation.toLowerCase().includes(query) ||
                  c.department.toLowerCase().includes(query) ||
                  c.officeLocation.toLowerCase().includes(query) ||
                  c.email.toLowerCase().includes(query) ||
                  c.phone.includes(query);
                return matchesDept && matchesSearch;
              })
              .map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 shadow-md"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center shrink-0 overflow-hidden text-purple-300 font-bold text-base">
                      {contact.avatarUrl ? (
                        <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full object-cover" />
                      ) : (
                        contact.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                          {contact.category}
                        </span>
                        <span className="text-xs text-slate-400 truncate">{contact.department}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5 truncate">{contact.name}</h4>
                      <p className="text-xs text-purple-400 font-medium">{contact.designation}</p>
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{contact.officeLocation}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-slate-400 font-mono text-[11px]">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-1 hover:text-purple-300 transition-colors"
                        >
                          <Mail className="w-3 h-3 text-purple-400" />
                          <span>{contact.email}</span>
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-1 hover:text-emerald-300 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{contact.phone}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => openEditDirectoryModal(contact)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 border border-transparent hover:border-purple-800/40 transition-colors"
                        title="Edit faculty details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDirectoryContact(contact.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors"
                        title="Delete faculty contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. HELPDESK TICKETS & INQUIRIES TAB */}
      {/* ========================================================================= */}
      {activeSection === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Student Support Inquiries & Tickets</h3>
              <p className="text-xs text-slate-400">
                Review questions, document requests, and exam inquiries submitted by students
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              {(['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setInquiryFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    inquiryFilterStatus === st
                      ? 'bg-rose-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' && `All (${inquiries.length})`}
                  {st === 'OPEN' && `Open (${inquiries.filter((i) => i.status === 'OPEN').length})`}
                  {st === 'IN_REVIEW' && `In Review (${inquiries.filter((i) => i.status === 'IN_REVIEW').length})`}
                  {st === 'RESOLVED' && `Resolved (${inquiries.filter((i) => i.status === 'RESOLVED').length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {inquiries
              .filter((i) => (inquiryFilterStatus === 'ALL' ? true : i.status === inquiryFilterStatus))
              .map((inq) => (
                <div
                  key={inq.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 shadow-lg ${
                    inq.status === 'RESOLVED'
                      ? 'border-emerald-900/60 bg-slate-900/70'
                      : inq.status === 'IN_REVIEW'
                      ? 'border-amber-900/60 bg-slate-900/90'
                      : 'border-rose-900/60 bg-slate-900/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-slate-400 font-semibold">#{inq.id.slice(0, 8)}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-semibold text-sky-400">{inq.category}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-400">{inq.department}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase font-mono ${
                          inq.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                            : inq.status === 'IN_REVIEW'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                        }`}
                      >
                        {inq.status === 'RESOLVED' ? '✓ Resolved' : inq.status === 'IN_REVIEW' ? '⏳ In Review' : '● Open Ticket'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Student details */}
                  <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 font-mono">
                    <span className="text-white font-bold">{inq.userName}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-amber-300 font-medium">Student ID: {inq.studentId}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{inq.userEmail}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{inq.subject}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">{inq.details}</p>
                  </div>

                  {/* Screenshot / File attachment */}
                  {inq.attachmentUrl && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1 text-sky-400">
                          <FileText className="w-3.5 h-3.5" />
                          Attached Student Screenshot / File
                        </span>
                        <button
                          onClick={() => setInquiryImageZoom(inq.attachmentUrl || null)}
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Zoom Full Screen</span>
                        </button>
                      </div>
                      {inq.attachmentUrl.startsWith('data:image') || /\.(png|jpg|jpeg|webp|gif)/i.test(inq.attachmentUrl) ? (
                        <img
                          src={inq.attachmentUrl}
                          alt="Student attachment"
                          onClick={() => setInquiryImageZoom(inq.attachmentUrl || null)}
                          className="max-h-48 rounded-lg border border-slate-800 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <a
                          href={inq.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Attached Document</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Official Admin Reply */}
                  {inq.adminReply && (
                    <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs space-y-1">
                      <div className="flex items-center justify-between text-purple-300 font-semibold font-mono text-[11px]">
                        <span>Official University Reply</span>
                        {inq.repliedAt && <span>{new Date(inq.repliedAt).toLocaleString()}</span>}
                      </div>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{inq.adminReply}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => openReplyInquiryModal(inq)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{inq.adminReply ? 'Update Official Response' : 'Reply to Student'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteInquiry(inq.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: NOTICE */}
      {/* ========================================================================= */}
      {noticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4">
            <button
              onClick={() => setNoticeModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Publish Official Notice</h3>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Fall 2026 Course Advising & Registration Schedule"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={noticeCat}
                    onChange={(e) => setNoticeCat(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Transport">Transport</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Holiday">Holiday</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Department</label>
                <select
                  value={noticeDept}
                  onChange={(e) => setNoticeDept(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="All Departments">All Departments</option>
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

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Batch</label>
                  <input
                    type="text"
                    value={noticeBatch}
                    onChange={(e) => setNoticeBatch(e.target.value)}
                    placeholder="All Batches or 65, 64..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Section</label>
                  <input
                    type="text"
                    value={noticeSection}
                    onChange={(e) => setNoticeSection(e.target.value)}
                    placeholder="All Sections or A, B, C..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Action Deadline (Optional)</label>
                  <input
                    type="date"
                    value={noticeDeadline}
                    onChange={(e) => setNoticeDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Source URL</label>
                  <input
                    type="url"
                    value={noticeSource}
                    onChange={(e) => setNoticeSource(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notice Description / Content *</label>
                <textarea
                  rows={4}
                  required
                  value={noticeDesc}
                  onChange={(e) => setNoticeDesc(e.target.value)}
                  placeholder="Official notice body published by City University administration..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Official Notice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EXAM */}
      {/* ========================================================================= */}
      {examModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4">
            <button
              onClick={() => setExamModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Add Exam Schedule</h3>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateExam} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={examCourse}
                  onChange={(e) => setExamCourse(e.target.value)}
                  placeholder="e.g. Database Management Systems"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={examCode}
                    onChange={(e) => setExamCode(e.target.value)}
                    placeholder="CSE 311"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Final">Final Term</option>
                    <option value="Midterm">Mid Term</option>
                    <option value="Quiz">Class Quiz</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <select
                  value={examDept}
                  onChange={(e) => setExamDept(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
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

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Batch *</label>
                  <input
                    type="text"
                    required
                    value={examBatch}
                    onChange={(e) => setExamBatch(e.target.value)}
                    placeholder="e.g. 65, 64"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Section *</label>
                  <input
                    type="text"
                    required
                    value={examSection}
                    onChange={(e) => setExamSection(e.target.value)}
                    placeholder="e.g. B, A, C"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Exam Date *</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot *</label>
                  <input
                    type="text"
                    required
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    placeholder="10:00 AM - 12:00 PM"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hall / Room (Khagan Campus) *</label>
                <input
                  type="text"
                  required
                  value={examLocation}
                  onChange={(e) => setExamLocation(e.target.value)}
                  placeholder="Academic Bldg 1, Room 304"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Exam Routine'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EVENT */}
      {/* ========================================================================= */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4">
            <button
              onClick={() => setEventModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Publish Campus Event</h3>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. City University Inter-University Tech Fest 2026"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organizing Club / Dept *</label>
                <input
                  type="text"
                  required
                  value={eventClub}
                  onChange={(e) => setEventClub(e.target.value)}
                  placeholder="CPCCU / Robotics Club / Department of CSE"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Department</label>
                <select
                  value={eventDept}
                  onChange={(e) => setEventDept(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="All Departments">All Departments</option>
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

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Batch</label>
                  <input
                    type="text"
                    value={eventBatch}
                    onChange={(e) => setEventBatch(e.target.value)}
                    placeholder="All Batches or 65, 64..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Section</label>
                  <input
                    type="text"
                    value={eventSection}
                    onChange={(e) => setEventSection(e.target.value)}
                    placeholder="All Sections or A, B, C..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot *</label>
                  <input
                    type="text"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="10:00 AM - 04:00 PM"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Event Format</label>
                  <select
                    value={eventFormat}
                    onChange={(e) => setEventFormat(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PHYSICAL">📍 In-Person (Campus)</option>
                    <option value="ONLINE">🌐 Online Webinar</option>
                    <option value="HYBRID">⚡ Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Max Seat Capacity</label>
                  <input
                    type="number"
                    value={eventMaxCapacity}
                    onChange={(e) => setEventMaxCapacity(e.target.value)}
                    placeholder="200"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {(eventFormat === 'ONLINE' || eventFormat === 'HYBRID') && (
                <div>
                  <label className="block text-xs font-medium text-purple-300 mb-1">Online Stream / Meeting URL (Zoom / Meet)</label>
                  <input
                    type="url"
                    value={eventMeetingUrl}
                    onChange={(e) => setEventMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/xyz-abcd-efg"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-purple-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Location / Venue *</label>
                <input
                  type="text"
                  required
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Khagan Permanent Campus Auditorium"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Registration Deadline (Optional)</label>
                <input
                  type="date"
                  value={eventDeadline}
                  onChange={(e) => setEventDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <ImageOrFileUpload
                  label="Event Banner / Poster Image (Phone / PC)"
                  value={eventBanner}
                  onChange={setEventBanner}
                  accept="image/*"
                  isImageOnly={true}
                  placeholder="Upload event poster from camera/gallery/PC or paste image URL"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Event Description *</label>
                <textarea
                  rows={3}
                  required
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Event details, schedule, eligible participants..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Campus Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: STUDY RESOURCE */}
      {/* ========================================================================= */}
      {resourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4">
            <button
              onClick={() => setResourceModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Add Academic Study Material</h3>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateResource} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. CSE 311 Database System Normalization Notes"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Course Name *</label>
                  <input
                    type="text"
                    required
                    value={resCourse}
                    onChange={(e) => setResCourse(e.target.value)}
                    placeholder="Database Management"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={resCode}
                    onChange={(e) => setResCode(e.target.value)}
                    placeholder="CSE 311"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Notes">Lecture Notes</option>
                    <option value="Past Questions">Past Trimester Question</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Syllabus">Course Syllabus</option>
                    <option value="Lecture Slides">Lecture Slides</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={resDept}
                    onChange={(e) => setResDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Electrical & Electronic Engineering">EEE</option>
                    <option value="Business Administration">BBA</option>
                    <option value="Civil Engineering">Civil</option>
                    <option value="Department of English">English</option>
                    <option value="Department of Law">Law</option>
                    <option value="Department of Pharmacy">Pharmacy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Batch</label>
                  <input
                    type="text"
                    value={resBatch}
                    onChange={(e) => setResBatch(e.target.value)}
                    placeholder="All Batches or 65, 64..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Section</label>
                  <input
                    type="text"
                    value={resSection}
                    onChange={(e) => setResSection(e.target.value)}
                    placeholder="All Sections or A, B, C..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <ImageOrFileUpload
                  label="Resource File (PDF, DOCX, Notes, Slides) or Drive Link *"
                  value={resUrl}
                  onChange={setResUrl}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                  placeholder="Upload study file from phone/PC or paste Google Drive link"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !resUrl}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Study Material'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: BUS SCHEDULE */}
      {/* ========================================================================= */}
      {busModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4">
            <button
              onClick={() => setBusModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Add Shuttle Bus Route</h3>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBus} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Route Name *</label>
                <input
                  type="text"
                  required
                  value={busRoute}
                  onChange={(e) => setBusRoute(e.target.value)}
                  placeholder="e.g. Mirpur Route (Via Gabtoli & Birulia)"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bus Number</label>
                  <input
                    type="text"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    placeholder="CU Shuttle #09"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={busDriverPhone}
                    onChange={(e) => setBusDriverPhone(e.target.value)}
                    placeholder="01711-XXXXXX"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Departure Point *</label>
                  <input
                    type="text"
                    required
                    value={busDeparturePoint}
                    onChange={(e) => setBusDeparturePoint(e.target.value)}
                    placeholder="Mirpur-10 Roundabout"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={busDestination}
                    onChange={(e) => setBusDestination(e.target.value)}
                    placeholder="Khagan Permanent Campus"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Morning Departure Time</label>
                  <input
                    type="text"
                    value={busDepartureTime}
                    onChange={(e) => setBusDepartureTime(e.target.value)}
                    placeholder="07:30 AM"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Evening Return Time</label>
                  <input
                    type="text"
                    value={busReturnTime}
                    onChange={(e) => setBusReturnTime(e.target.value)}
                    placeholder="04:30 PM"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Shuttle Route'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DIRECTORY CONTACT (ADD / EDIT) */}
      {/* ========================================================================= */}
      {directoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4 my-auto">
            <button
              onClick={() => {
                setDirectoryModalOpen(false);
                resetDirForm();
              }}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">
              {editingContactId ? 'Edit Faculty / Staff Contact' : 'Add Faculty Member to Directory'}
            </h3>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDirectoryContact} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name & Title *</label>
                <input
                  type="text"
                  required
                  value={dirName}
                  onChange={(e) => setDirName(e.target.value)}
                  placeholder="e.g. Dr. Mohammad Rashedul Islam"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={dirDesignation}
                    onChange={(e) => setDirDesignation(e.target.value)}
                    placeholder="e.g. Associate Professor & Head"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={dirCategory}
                    onChange={(e) => setDirCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="FACULTY">Faculty Member</option>
                    <option value="ADMIN_OFFICE">Administrative Officer</option>
                    <option value="HOTLINE">Emergency / Hotline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department / Office</label>
                <select
                  value={dirDepartment}
                  onChange={(e) => setDirDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Department of English">Department of English</option>
                  <option value="Department of Law">Department of Law</option>
                  <option value="Department of Pharmacy">Department of Pharmacy</option>
                  <option value="Textile Engineering">Textile Engineering</option>
                  <option value="University Administration">University Administration</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                  <option value="Medical Center">Medical Center</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={dirEmail}
                    onChange={(e) => setDirEmail(e.target.value)}
                    placeholder="faculty@cityuniversity.ac.bd"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone / Ext *</label>
                  <input
                    type="text"
                    required
                    value={dirPhone}
                    onChange={(e) => setDirPhone(e.target.value)}
                    placeholder="01711-XXXXXX"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Office Room (Khagan Campus) *</label>
                  <input
                    type="text"
                    required
                    value={dirOfficeLocation}
                    onChange={(e) => setDirOfficeLocation(e.target.value)}
                    placeholder="Academic Bldg 1, Room 302"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Consulting Hours</label>
                  <input
                    type="text"
                    value={dirAvailableHours}
                    onChange={(e) => setDirAvailableHours(e.target.value)}
                    placeholder="Sun - Thu: 10:00 AM - 04:00 PM"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <ImageOrFileUpload
                  label="Teacher Photo (Phone / PC Gallery / Webcam)"
                  value={dirAvatarUrl}
                  onChange={setDirAvatarUrl}
                  accept="image/*"
                  isImageOnly={true}
                  placeholder="Upload profile photo from phone/PC or paste image URL"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingContactId ? 'Update Faculty Details' : 'Save to Directory'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: HELPDESK INQUIRY REPLY */}
      {/* ========================================================================= */}
      {replyModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4 my-auto">
            <button
              onClick={() => {
                setReplyModalOpen(false);
                setSelectedInquiry(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">Student Ticket Official Reply</h3>

            {/* Student question summary */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>From: <strong className="text-white">{selectedInquiry.userName}</strong> ({selectedInquiry.studentId})</span>
                <span className="text-amber-400">{selectedInquiry.department}</span>
              </div>
              <p className="font-bold text-slate-100 pt-1">{selectedInquiry.subject}</p>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedInquiry.details}</p>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleReplyInquiry} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ticket Status</label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="OPEN">Open (Needs Attention)</option>
                  <option value="IN_REVIEW">In Review (Processing)</option>
                  <option value="RESOLVED">Resolved (Answered)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Official Response / Guidance *</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official guidance or instruction for the student..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Official Response'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: ATTACHMENT IMAGE FULL ZOOM */}
      {/* ========================================================================= */}
      {inquiryImageZoom && (
        <div
          onClick={() => setInquiryImageZoom(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[85vh] my-auto">
            <button
              onClick={() => setInquiryImageZoom(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-lg text-white hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={inquiryImageZoom}
              alt="Full attachment zoom"
              className="max-h-[85vh] max-w-full rounded-2xl border border-slate-800 shadow-2xl object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* Admin Attendee Roster & Door Scanner Modal */}
      {selectedAdminEvent && (
        <AdminAttendeesModal
          isOpen={!!selectedAdminEvent}
          onClose={() => {
            setSelectedAdminEvent(null);
            loadAll();
          }}
          event={selectedAdminEvent}
        />
      )}
    </div>
  );
};
