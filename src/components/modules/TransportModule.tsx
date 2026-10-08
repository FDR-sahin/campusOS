import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, Phone, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { BusSchedule } from '../../types';
import { CardSkeleton } from '../common/SkeletonLoader';

export const TransportModule: React.FC = () => {
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransport() {
      try {
        setLoading(true);
        const res = await api.getBusSchedules();
        if (res.success) {
          setSchedules(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTransport();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
            <span>OFFICIAL CAMPUS TRANSIT & COMMUTE</span>
            <span className="text-slate-600">·</span>
            <span>City University Transport Committee</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">University Shuttle Bus Routines</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated student transport linking major Dhaka hubs to the Permanent Campus at Khagan, Birulia, Savar.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg text-xs text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Winter Timing Active: Morning buses depart 15m early</span>
        </div>
      </div>

      {/* Routine Cards Grid */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((bus) => (
            <div
              key={bus.id}
              className="p-6 rounded-2xl border border-[#253966] bg-[#131f3e] hover:border-sky-500/50 transition-all space-y-4 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#18264d] text-sky-400 border border-sky-800">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-400">{bus.routeNumber}</span>
                    <h2 className="text-base font-bold text-white">{bus.routeName}</h2>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0c142b] border border-[#253966] text-slate-300">
                  {bus.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#0c142b] border border-[#202f54] space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="text-slate-400">Origin:</span>
                    <span className="font-semibold text-white">{bus.departurePoint}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="text-slate-400">Destination:</span>
                    <span className="text-emerald-400 font-semibold">{bus.destination}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-[#0c142b] border border-[#202f54]">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>Morning Departure</span>
                    </div>
                    <div className="font-bold text-white mt-0.5">{bus.morningDepTime}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0c142b] border border-[#202f54]">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Evening Return</span>
                    </div>
                    <div className="font-bold text-white mt-0.5">{bus.returnDepTime}</div>
                  </div>
                </div>

                {/* Route stops */}
                <div>
                  <div className="text-[11px] text-slate-400 font-medium mb-1">Route Waypoints:</div>
                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-200">
                    {bus.viaPoints.map((point, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-2 py-0.5 rounded bg-[#0c142b] border border-[#202f54]">{point}</span>
                        {idx < bus.viaPoints.length - 1 && <span className="text-slate-600">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#223359] flex items-center justify-between text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>{bus.contactPerson}</span>
                </span>
                <span className="text-emerald-400">✓ Official Route</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guidelines Card */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2 text-xs text-slate-300">
        <h3 className="font-bold text-white font-mono uppercase tracking-wider text-xs">University Transport Guidelines:</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>Carry your digital CampusOS student pass or physical university ID card when boarding.</li>
          <li>Be present at your designated stop 10 minutes prior to scheduled departure.</li>
          <li>In case of road blockages or delays, supervisors post instant notices on the CampusOS Today feed.</li>
        </ul>
      </div>
    </div>
  );
};
