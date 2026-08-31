import React from 'react';

export const CardSkeleton = () => (
  <div className="flex flex-col rounded-xl overflow-hidden bg-[#12141c] border border-slate-800 animate-pulse">
    <div className="aspect-[3/4] w-full bg-slate-800/60" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-slate-800/80 rounded w-4/5" />
      <div className="h-3 bg-slate-800/50 rounded w-3/5" />
      <div className="pt-2 border-t border-slate-800/60 flex justify-between">
        <div className="h-3 bg-slate-800/50 rounded w-1/3" />
        <div className="h-3 bg-slate-800/50 rounded w-1/4" />
      </div>
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-8">
    <div className="flex flex-col md:flex-row gap-8 bg-[#12141c] p-6 rounded-2xl border border-slate-800">
      <div className="w-48 sm:w-60 aspect-[3/4] bg-slate-800 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-slate-800 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-6 bg-slate-800 rounded w-20" />
          <div className="h-6 bg-slate-800 rounded w-24" />
        </div>
        <div className="space-y-2 pt-4">
          <div className="h-4 bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-800 rounded w-5/6" />
          <div className="h-4 bg-slate-800 rounded w-4/6" />
        </div>
      </div>
    </div>
  </div>
);

export const ReaderSkeleton = () => (
  <div className="max-w-4xl mx-auto py-12 px-4 space-y-6 animate-pulse">
    <div className="h-10 bg-slate-800 rounded-xl w-3/4 mx-auto" />
    <div className="aspect-[9/16] bg-slate-800/70 rounded-xl w-full max-w-2xl mx-auto" />
  </div>
);
