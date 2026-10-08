import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  ExternalLink,
  ShieldCheck,
  Check,
  Sparkles,
  Ticket,
  Share2,
} from 'lucide-react';
import { EventItem, EventRegistration } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  registration?: EventRegistration | null;
  onToggleRsvp: (event: EventItem) => void;
  onViewTicket: (event: EventItem) => void;
  rsvpLoading: boolean;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  registration,
  onToggleRsvp,
  onViewTicket,
  rsvpLoading,
}) => {
  const { user, openAuthModal } = useAuth();

  if (!isOpen || !event) return null;

  const isRsvped = (user && event.attendees?.includes(user.id)) || !!registration;
  const isOnline = event.eventType === 'ONLINE' || event.eventType === 'HYBRID';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner */}
        {event.bannerImage && (
          <div className="relative h-56 sm:h-64 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 overflow-hidden rounded-t-3xl bg-slate-950">
            <img
              src={event.bannerImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-950/80 text-sky-300 border border-sky-800/80 backdrop-blur-sm">
                {event.category}
              </span>
              {event.eventType && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-semibold backdrop-blur-sm ${
                    event.eventType === 'ONLINE'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                      : event.eventType === 'HYBRID'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {event.eventType === 'ONLINE' ? '🌐 ONLINE WEBINAR' : event.eventType === 'HYBRID' ? '⚡ HYBRID' : '📍 IN-PERSON'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Main Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-sky-400">{event.club}</span>
              <span className="text-slate-600">·</span>
              <span>Host: {event.host}</span>
              {event.department && event.department !== 'All Departments' && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300">{event.department}</span>
                </>
              )}
              {event.batch && event.batch !== 'All Batches' && (
                <span className="px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 font-mono text-[10px] border border-sky-800/50">
                  Batch {event.batch}
                </span>
              )}
              {event.section && event.section !== 'All Sections' && (
                <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-mono text-[10px] border border-amber-800/50">
                  Sec {event.section}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {event.title}
            </h1>
          </div>

          {/* Quick Schedule Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono">
                <span className="text-slate-400 block text-[10px]">Date & Time</span>
                <span className="font-bold text-white">{event.date}</span>
                <span className="text-slate-300 block text-[11px]">{event.time}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] font-mono">Venue / Location</span>
                <span className="font-bold text-white block truncate">{event.location}</span>
                <span className="text-slate-300 text-[11px]">Khagan Campus</span>
              </div>
            </div>
          </div>

          {/* Online participation link if applicable */}
          {isOnline && event.onlineMeetingUrl && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-sky-950/60 border border-purple-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-purple-300 font-semibold">
                  <Video className="w-4 h-4" />
                  <span>Online Video Stream & Meeting Link</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Join via Google Meet / Zoom with your university email account.
                </p>
              </div>

              <a
                href={event.onlineMeetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 justify-center shadow-lg shadow-purple-600/20"
              >
                <span>Join Online Meeting</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              About This Campus Event
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Capacity and Stats */}
          <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>{event.attendeesCount} Students Registered</span>
            </div>
            {event.maxCapacity && (
              <span className="text-slate-400">Capacity: {event.maxCapacity} seats</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {event.sourceUrl && (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Official Club Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {isRsvped && (
              <button
                onClick={() => onViewTicket(event)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Ticket className="w-4 h-4" />
                <span>View E-Pass & QR</span>
              </button>
            )}

            {!user ? (
              <button
                onClick={openAuthModal}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition-all"
              >
                Sign In to Register / RSVP
              </button>
            ) : (
              <button
                onClick={() => onToggleRsvp(event)}
                disabled={rsvpLoading}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isRsvped
                    ? 'bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/80'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25'
                }`}
              >
                {rsvpLoading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : isRsvped ? (
                  <span>Cancel Registration</span>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    <span>Register / Get QR Ticket</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

