import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  verified?: boolean;
  sourceUrl?: string;
  sourceType?: string;
  compact?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  verified = true,
  compact = false,
}) => {
  if (!verified) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-400/90 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Admin-Curated
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-xs">
      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
        <ShieldCheck className="w-3.5 h-3.5" />
        {compact ? 'Verified' : 'Verified by CampusOS'}
      </span>
      <span className="text-slate-600" aria-hidden="true">·</span>
      <span className="text-slate-400">Official City University</span>
    </div>
  );
};
