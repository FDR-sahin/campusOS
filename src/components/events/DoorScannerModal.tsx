import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  Search,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { EventItem, CheckInResult, EventRegistration } from '../../types';

interface DoorScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventItem;
  onCheckInSuccess?: (reg: EventRegistration) => void;
}

export const DoorScannerModal: React.FC<DoorScannerModalProps> = ({
  isOpen,
  onClose,
  event,
  onCheckInSuccess,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Play a pleasant Web Audio API beep sound for door check-in feedback
  const playBeep = (type: 'success' | 'warn' | 'error') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1); // D6
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'warn') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  const processTicketCode = async (rawCode: string) => {
    if (!rawCode.trim()) return;
    try {
      setLoading(true);
      setErrorMsg(null);

      // Extract ticket code if QR payload is JSON
      let cleanCode = rawCode.trim();
      try {
        if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
          const parsed = JSON.parse(cleanCode);
          if (parsed.ticketCode) {
            cleanCode = parsed.ticketCode;
          }
        }
      } catch {
        // use raw string
      }

      const res = await api.checkInAttendee({
        ticketCode: cleanCode,
        eventId: event?.id,
      });

      setScanResult(res);

      if (res.success) {
        if (res.alreadyCheckedIn) {
          playBeep('warn');
        } else {
          playBeep('success');
          if (res.registration && onCheckInSuccess) {
            onCheckInSuccess(res.registration);
          }
        }
      } else {
        playBeep('error');
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      playBeep('error');
      setErrorMsg(err.message || 'Verification failed. Please check ticket code.');
    } finally {
      setLoading(false);
    }
  };

  // Setup HTML5 QR Code Scanner
  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {
          // ignore
        }
        scannerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      const qrRegionId = 'html5-door-reader';
      const el = document.getElementById(qrRegionId);
      if (el && !scannerRef.current) {
        try {
          const scanner = new Html5QrcodeScanner(
            qrRegionId,
            {
              fps: 10,
              qrbox: { width: 220, height: 220 },
              supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
              rememberLastUsedCamera: true,
            },
            false
          );

          scanner.render(
            (decodedText) => {
              processTicketCode(decodedText);
            },
            () => {
              // frame scanned without QR
            }
          );

          scannerRef.current = scanner;
          setScanning(true);
        } catch (err) {
          console.error('Failed to init QR scanner', err);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {
          // ignore
        }
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Scanner"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>DOOR CHECK-IN & ATTENDEE SCANNER</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {event ? event.title : 'Live Campus Event Check-in'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Scan attendee QR code passes or manually enter Ticket / Student ID for instant admission.
          </p>
        </div>

        {/* Live Result Feedback Banner */}
        {scanResult && (
          <div
            className={`p-4 rounded-2xl border transition-all animate-fadeIn ${
              scanResult.alreadyCheckedIn
                ? 'bg-amber-950/80 border-amber-600 text-amber-200'
                : scanResult.success
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-lg shadow-emerald-950/50'
                : 'bg-rose-950/80 border-rose-600 text-rose-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {scanResult.success ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-bold">
                    {scanResult.alreadyCheckedIn
                      ? '⚠️ Attendee Already Checked In'
                      : scanResult.success
                      ? '✓ Entry Approved & Checked In!'
                      : 'Verification Failed'}
                  </h4>
                  <p className="text-xs mt-0.5 opacity-90">{scanResult.message}</p>
                </div>
              </div>

              <button
                onClick={() => setScanResult(null)}
                className="text-xs p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {scanResult.registration && (
              <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] opacity-70 block">Name</span>
                  <span className="font-bold text-white">{scanResult.registration.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-70 block">Student ID</span>
                  <span className="font-bold text-white">{scanResult.registration.studentId}</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-70 block">Ticket #</span>
                  <span className="font-bold text-white">{scanResult.registration.ticketCode}</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-70 block">Class</span>
                  <span>Batch {scanResult.registration.batch || '65'} ({scanResult.registration.section || 'B'})</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] opacity-70 block">Department</span>
                  <span className="truncate block">{scanResult.registration.department}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMsg && !scanResult && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scanner & Manual Input Split */}
        <div className="space-y-4">
          {/* Camera QR Viewport */}
          <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between pb-2 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                Live Camera Lens
              </span>
              <span className="text-[10px] font-mono text-slate-500">Hold QR Pass up to camera</span>
            </div>
            <div id="html5-door-reader" className="overflow-hidden rounded-xl border border-slate-800 bg-black/40" />
          </div>

          {/* Manual Entry Fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              processTicketCode(manualCode);
            }}
            className="space-y-2"
          >
            <label className="block text-xs font-medium text-slate-300">
              Manual Ticket Pass ID or Student ID Search
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. CU-EVT-IUPC-9281 or 213-15-4921"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !manualCode.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shrink-0"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Check In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

