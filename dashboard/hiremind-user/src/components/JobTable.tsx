import React from 'react';
import { JobApplication, SortConfig } from '../types';
import { StatusBadge, TagBadge } from './Badges';
import FitScore from './FitScore';
import { FileText, MessageSquare, MapPin, Building2, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface JobTableProps {
  jobs: JobApplication[];
  onJobClick: (job: JobApplication, tab?: 'overview' | 'jd' | 'channels' | 'notes') => void;
  onStatusClick: (job: JobApplication) => void;
  sortConfig: SortConfig;
  onSort: (field: 'status' | 'appliedTime') => void;
}

export default function JobTable({ jobs, onJobClick, onStatusClick, sortConfig, onSort }: JobTableProps) {
  const SortIcon = ({ field }: { field: 'status' | 'appliedTime' }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="table-header min-w-[250px]">Job Title</th>
            <th className="table-header">Company</th>
            <th className="table-header">Industry</th>
            <th className="table-header">Location</th>
            <th className="table-header">Exp. Level</th>
            <th className="table-header">Fit Score</th>
            <th 
              className="table-header cursor-pointer hover:bg-slate-50 transition-colors group/header"
              onClick={() => onSort('status')}
            >
              <div className="flex items-center gap-1">
                Status
                <div className={cn(
                  "transition-opacity",
                  sortConfig.field === 'status' ? "opacity-100 text-brand-600" : "opacity-0 group-hover/header:opacity-50"
                )}>
                  <SortIcon field="status" />
                  {sortConfig.field !== 'status' && <ChevronDown size={14} />}
                </div>
              </div>
            </th>
            <th className="table-header">Channels</th>
            <th 
              className="table-header cursor-pointer hover:bg-slate-50 transition-colors group/header"
              onClick={() => onSort('appliedTime')}
            >
              <div className="flex items-center gap-1">
                Applied Time
                <div className={cn(
                  "transition-opacity",
                  sortConfig.field === 'appliedTime' ? "opacity-100 text-brand-600" : "opacity-0 group-hover/header:opacity-50"
                )}>
                  <SortIcon field="appliedTime" />
                  {sortConfig.field !== 'appliedTime' && <ChevronDown size={14} />}
                </div>
              </div>
            </th>
            <th className="table-header">Docs</th>
            <th className="table-header">Tags</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr 
              key={job.id} 
              className={cn(
                "hover:bg-slate-50/80 transition-colors cursor-pointer group",
                job.tags.includes('Ghosted') && "opacity-70"
              )}
              onClick={() => onJobClick(job)}
            >
              <td className="table-cell">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {job.jobTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {job.id.padStart(4, '0')}</span>
                </div>
              </td>
              <td className="table-cell">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {job.company.charAt(0)}
                  </div>
                  {job.company}
                </div>
              </td>
              <td className="table-cell text-slate-500">{job.industry}</td>
              <td className="table-cell">
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate max-w-[120px]">{job.location}</span>
                </div>
              </td>
              <td className="table-cell">
                <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                  {job.experienceLevel}
                </span>
              </td>
              <td className="table-cell">
                <FitScore score={job.fitScore} breakdown={job.fitBreakdown} />
              </td>
              <td className="table-cell">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusClick(job);
                  }}
                  className="hover:scale-105 transition-transform"
                >
                  <StatusBadge status={job.status} />
                </button>
              </td>
              <td className="table-cell">
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                  {job.selectedChannels.slice(0, 2).map(c => (
                    <span key={c} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
                      {c}
                    </span>
                  ))}
                  {job.selectedChannels.length > 2 && (
                    <span className="text-[10px] text-slate-400">+{job.selectedChannels.length - 2}</span>
                  )}
                </div>
              </td>
              <td className="table-cell font-mono text-[11px] text-slate-400">
                {job.appliedTime}
              </td>
              <td className="table-cell">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Simulating Resume Preview: Opening ${job.company}_Resume.pdf`);
                    }}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" 
                    title="View Resume"
                  >
                    <FileText size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Simulating Cover Letter Preview: Opening ${job.company}_Cover_Letter.pdf`);
                    }}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" 
                    title="View Cover Letter"
                  >
                    <ExternalLink size={16} />
                  </button>
                  {job.notes.length > 0 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick(job, 'notes');
                      }}
                      className="flex items-center gap-0.5 text-slate-400 ml-1 hover:text-brand-600 transition-colors"
                    >
                      <MessageSquare size={14} />
                      <span className="text-[10px] font-bold">{job.notes.length}</span>
                    </button>
                  )}
                </div>
              </td>
              <td className="table-cell">
                <div className="flex flex-wrap gap-1 max-w-[120px]">
                  {job.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
