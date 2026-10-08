import React from 'react';
import { ShieldCheck, Phone, MapPin, Globe, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-20 border-t border-slate-900 bg-slate-950/90 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center font-mono font-bold text-white text-xs">
                CU
              </div>
              <span className="font-bold text-white text-sm tracking-tight">CampusOS · City University</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Student-first digital campus companion for City University, Bangladesh. Designed for the CPCCU AI-Powered Web App Development & Deployment Hackathon 2026.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official University Data Grounding</span>
            </div>
          </div>

          {/* Campuses */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">University Campuses</h4>
            <div className="space-y-2 text-[11px]">
              <div>
                <p className="text-slate-200 font-medium">Permanent Campus</p>
                <p className="text-slate-500">Khagan, Birulia, Savar, Dhaka-1216</p>
              </div>
              <div>
                <p className="text-slate-200 font-medium">City Campus</p>
                <p className="text-slate-500">13/A, Panthapath, Dhaka-1205</p>
              </div>
            </div>
          </div>

          {/* Emergency & Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">Helpline & Contacts</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-sky-400" />
                <span>Proctor Office: +880 1711-234567</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-sky-400" />
                <span>Registrar Office: +880 2 224441234</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-sky-400" />
                <span>Medical Center: Ext. 104 (Khagan)</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-sky-400" />
                <span>Transport Supervisor: 01711-998877</span>
              </li>
            </ul>
          </div>

          {/* Official Verification */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">Official Portals</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a
                  href="https://cityuniversity.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-sky-400 transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  <span>Main University Website</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://cityuniversity.ac.bd/student-portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-sky-400 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Student ERP / Advising Portal</span>
                </a>
              </li>
              <li>
                <a
                  href="https://cityuniversity.ac.bd/notices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-sky-400 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Official Notice Archive</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 CampusOS · Developed for City University, Bangladesh. Not affiliated with duplicate commercial mirrors.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-emerald-400">System Status: All Services Operational</span>
            <span className="text-slate-800">·</span>
            <span>Trimester: Fall 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
