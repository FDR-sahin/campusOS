import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  Building2,
  Download,
  Share2,
  ShieldCheck,
  Video,
  Printer,
  Sparkles,
} from 'lucide-react';
import { EventItem, EventRegistration } from '../../types';

interface EventTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  registration: EventRegistration;
}

export const EventTicketModal: React.FC<EventTicketModalProps> = ({
  isOpen,
  onClose,
  event,
  registration,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !registration) return;

    // Generate QR Code data payload
    const qrPayload = JSON.stringify({
      ticketCode: registration.ticketCode,
      eventId: registration.eventId,
      userId: registration.userId,
      studentId: registration.studentId,
      name: registration.userName,
      dept: registration.department,
    });

    QRCode.toDataURL(qrPayload, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [isOpen, registration]);

  if (!isOpen || !registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `ticket-${registration.ticketCode}.png`;
    link.click();
  };

  const isOnline = event.eventType === 'ONLINE' || registration.participationType === 'ONLINE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Pass"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[11px] font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OFFICIAL CAMPUSOS E-PASS</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight pt-1">
            Verified Event Entry Ticket
          </h2>
          <p className="text-xs text-slate-400">
            Present this scannable QR pass at the entrance gate or event desk.
          </p>
        </div>

        {/* The Ticket Pass Visual Container */}
        <div
          ref={ticketRef}
          className="relative rounded-2xl overflow-hidden border border-slate-700 bg-gradient-to-b from-[#131f3e] via-[#0f172a] to-[#0c1322] shadow-xl p-6 space-y-5"
        >
          {/* Top Bar with Cutout Aesthetic */}
          <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-700/80 pb-4">
            <div>
              <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
                {event.club || 'City University Campus'}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5 leading-snug">
                {event.title}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                  registration.checkedIn
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-sky-950 text-sky-300 border border-sky-800'
                }`}
              >
                {registration.checkedIn ? '✓ CHECKED IN' : 'VALID PASS'}
              </span>
            </div>
          </div>

          {/* Center: QR Code & Pass ID */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-2">
            <div className="p-3 bg-white rounded-2xl shadow-md border-4 border-slate-800 shrink-0">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${registration.ticketCode}`}
                  className="w-36 h-36 object-contain"
                />
              ) : (
                <div className="w-36 h-36 bg-slate-200 animate-pulse rounded-lg" />
              )}
            </div>

            <div className="flex-1 space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Ticket ID</span>
                <p className="font-mono text-sm font-bold text-sky-300 tracking-wider">
                  {registration.ticketCode}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Attendee Name</span>
                <p className="font-semibold text-white">{registration.userName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Student ID</span>
                  <p className="font-mono text-slate-200">{registration.studentId || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Class</span>
                  <p className="font-mono text-slate-200">
                    {registration.batch ? `Batch ${registration.batch}` : 'General'} {registration.section || ''}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Department</span>
                <p className="text-slate-300 truncate">{registration.department}</p>
              </div>
            </div>
          </div>

          {/* Event Venue & Time Details */}
          <div className="pt-3 border-t border-dashed border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Date & Time</p>
                <p className="font-semibold font-mono">{event.date} · {event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-200">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Venue</p>
                <p className="font-semibold truncate">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Online participation link if applicable */}
          {isOnline && event.onlineMeetingUrl && (
            <div className="p-3 rounded-xl bg-sky-950/70 border border-sky-800/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-sky-300">
                <Video className="w-4 h-4 shrink-0" />
                <span className="font-medium">Online Stream / Meeting Ready</span>
              </div>
              <a
                href={event.onlineMeetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] transition-colors"
              >
                Join Meeting →
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Save QR Image</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print E-Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};

