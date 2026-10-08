import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm animate-pulse space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-800 rounded w-1/4" />
            <div className="h-4 bg-slate-800 rounded w-16" />
          </div>
          <div className="h-5 bg-slate-700/80 rounded w-3/4" />
          <div className="space-y-2 pt-1">
            <div className="h-3.5 bg-slate-800 rounded w-full" />
            <div className="h-3.5 bg-slate-800 rounded w-5/6" />
          </div>
          <div className="pt-2 flex items-center gap-3">
            <div className="h-7 bg-slate-800 rounded w-28" />
            <div className="h-7 bg-slate-800 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};
