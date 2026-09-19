import React from 'react';

export const JobCardSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-4">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 rounded w-2/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-slate-100 rounded-full w-20"></div>
        <div className="h-6 bg-slate-100 rounded-full w-24"></div>
        <div className="h-6 bg-slate-100 rounded-full w-16"></div>
      </div>
      <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="h-8 bg-slate-200 rounded-lg w-28"></div>
      </div>
    </div>
  );
};

export const StatsCardSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse flex items-center space-x-4">
      <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-7 bg-slate-200 rounded w-1/3"></div>
      </div>
    </div>
  );
};
