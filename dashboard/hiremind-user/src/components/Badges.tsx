import React from 'react';
import { cn } from '../lib/utils';
import { JobStatus, Tag } from '../types';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge = ({ children, className }: BadgeProps) => (
  <span className={cn("badge", className)}>
    {children}
  </span>
);

export const StatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  const styles: Record<JobStatus, string> = {
    'Applied': 'bg-slate-100 text-slate-600 border border-slate-200',
    'Screening': 'bg-blue-100 text-blue-600 border border-blue-200',
    '1st Interview': 'bg-purple-100 text-purple-600 border border-purple-200',
    '2nd Interview': 'bg-purple-100 text-purple-600 border border-purple-200',
    '3rd Interview': 'bg-purple-100 text-purple-600 border border-purple-200',
    'Final Interview': 'bg-indigo-100 text-indigo-600 border border-indigo-200',
    'Offer': 'bg-emerald-100 text-emerald-600 border border-emerald-200',
    'Rejected': 'bg-rose-100 text-rose-600 border border-rose-200',
  };

  return (
    <Badge className={cn("px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm", styles[status])}>
      {status}
    </Badge>
  );
};

export const TagBadge: React.FC<{ tag: string }> = ({ tag }) => {
  const getTagStyle = (t: string) => {
    const lower = t.toLowerCase();
    if (lower.includes('referral')) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (lower.includes('high')) return 'bg-rose-50 text-rose-600 border-rose-100';
    if (lower.includes('ghosted')) return 'bg-slate-100 text-slate-500 border-slate-200';
    if (lower.includes('low')) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (lower.includes('recommended')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <Badge className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", getTagStyle(tag))}>
      {tag}
    </Badge>
  );
};
