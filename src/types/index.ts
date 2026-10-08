export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  department: string;
  batch?: string;
  section?: string;
  studentId?: string;
  avatarUrl?: string;
  savedNotices?: string[];
  savedExams?: string[];
  savedResources?: string[];
  rsvps?: string[];
  createdAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: 'Academic' | 'Examination' | 'Transport' | 'Scholarship' | 'Holiday' | 'General';
  department: string;
  batch?: string;
  section?: string;
  publishedAt: string;
  deadline?: string;
  sourceUrl: string;
  sourceType: 'OFFICIAL_CITY_UNIVERSITY' | 'ADMIN_CURATED' | 'STUDENT_POST';
  verified: boolean;
  priority: 'URGENT' | 'IMPORTANT' | 'NORMAL';
  actionPrompt?: string;
  actionUrl?: string;
  createdBy: string;
  views: number;
}

export interface Exam {
  id: string;
  course: string;
  courseCode: string;
  department: string;
  batch?: string;
  section?: string;
  examType: 'Midterm' | 'Final' | 'Quiz' | 'Viva';
  date: string;
  time: string;
  location: string;
  sourceUrl: string;
  verified: boolean;
  notes?: string;
}

export interface EventRegistration {
  id: string;
  ticketCode: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId: string;
  department: string;
  batch?: string;
  section?: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  participationType: 'IN_PERSON' | 'ONLINE';
  notes?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  club: string;
  host: string;
  department?: string;
  batch?: string;
  section?: string;
  date: string;
  time: string;
  location: string;
  category: 'Competition' | 'Seminar' | 'Workshop' | 'Cultural' | 'Sports' | 'Career' | 'Meetup' | 'Hackathon';
  eventType?: 'PHYSICAL' | 'ONLINE' | 'HYBRID';
  onlineMeetingUrl?: string;
  sourceUrl: string;
  sourceType: 'OFFICIAL_CITY_UNIVERSITY' | 'CLUB_VERIFIED';
  verified: boolean;
  attendeesCount: number;
  attendees: string[];
  maxCapacity?: number;
  registrationDeadline?: string;
  createdBy: string;
  bannerImage?: string;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  alreadyCheckedIn?: boolean;
  registration?: EventRegistration;
  event?: EventItem;
}

export interface Club {
  id: string;
  name: string;
  code: string;
  shortDescription: string;
  department: string;
  lead: string;
  email: string;
  membersCount: number;
  officialPage: string;
  logo: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  department: string;
  batch?: string;
  section?: string;
  course: string;
  courseCode: string;
  semester: string;
  category: 'Notes' | 'Past Questions' | 'Lab Manual' | 'Syllabus' | 'Lecture Slides';
  resourceUrl: string;
  fileSize?: string;
  verified: boolean;
  uploadedBy: string;
  uploadedByRole: 'STUDENT' | 'FACULTY' | 'ADMIN';
  downloadCount: number;
  createdAt: string;
}

export interface FAQItem {
  id: string;
  category: 'Registration' | 'Examination' | 'Transport' | 'Academic' | 'Clubs' | 'Facilities' | 'Waiver & Fees';
  question: string;
  answer: string;
  officialSource: string;
  verified: boolean;
}

export interface BusSchedule {
  id: string;
  routeNumber: string;
  routeName: string;
  departurePoint: string;
  destination: string;
  viaPoints: string[];
  morningDepTime: string;
  returnDepTime: string;
  status: 'Normal' | 'Slight Delay' | 'Winter Schedule Active';
  contactPerson: string;
}

export interface LostFoundItem {
  id: string;
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  location: string;
  date: string;
  category: 'ID Card' | 'Electronics' | 'Documents' | 'Accessories' | 'Other';
  contactMethod: string;
  contactName: string;
  status: 'OPEN' | 'RESOLVED';
  reportedBy: string;
  createdAt: string;
  imageUrl?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalNotices: number;
  urgentNoticesCount: number;
  upcomingExamsCount: number;
  upcomingEventsCount: number;
  totalResources: number;
  totalClubs: number;
  totalRsvps: number;
  busRoutesCount: number;
  openLostFoundCount: number;
}

export interface NoticeSummaryResult {
  about: string;
  whoIsAffected: string;
  importantDates: string;
  requiredAction: string;
  keyTakeaway: string;
}

export interface DirectoryContact {
  id: string;
  name: string;
  designation: string;
  department: string;
  category: 'FACULTY' | 'ADMIN_OFFICE' | 'HOTLINE';
  email: string;
  phone: string;
  officeLocation: string;
  availableHours?: string;
  avatarUrl?: string;
}

export interface HelpdeskInquiry {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  studentId: string;
  department: string;
  category: string;
  subject: string;
  details: string;
  attachmentUrl?: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}
