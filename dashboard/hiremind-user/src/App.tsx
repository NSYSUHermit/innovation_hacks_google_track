import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import JobTable from './components/JobTable';
import SidePanel from './components/SidePanel';
import Dashboard from './components/Dashboard';
import StatusModal from './components/StatusModal';
import FilterPanel from './components/FilterPanel';
import { MOCK_JOBS } from './lib/mockJobs';
import { JobApplication, JobStatus, InterviewRound, FilterState, SortConfig } from './types';
import { X, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';

const statusOrder: Record<JobStatus, number> = {
  "Offer": 7,
  "Final Interview": 6,
  "3rd Interview": 5,
  "2nd Interview": 4,
  "1st Interview": 3,
  "Screening": 2,
  "Applied": 1,
  "Rejected": 0
};

const initialFilters: FilterState = {
  status: [],
  channels: [],
  tags: [],
  fitScore: [0, 100],
  location: [],
  experience: [],
  highProbability: false,
  lowROI: false,
  needsFollowUp: false
};

export default function App() {
  const [activePage, setActivePage] = useState<'apps' | 'dashboard'>('apps');
  const [activeView, setActiveView] = useState<'active' | 'archived' | 'offers'>('active');
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [sidePanelTab, setSidePanelTab] = useState<'overview' | 'jd' | 'channels' | 'notes'>('overview');
  const [jobs, setJobs] = useState<JobApplication[]>(MOCK_JOBS);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'status', direction: 'desc' });
  
  // Status Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // 無資料庫同步法：攔截 URL 上的資料
  useEffect(() => {
    const syncDataFromHash = () => {
      // 使用 href.split 抓取原始字串，避免瀏覽器對 hash 自動 Decode 造成的崩潰
      const rawHash = window.location.href.split('#syncToken=')[1];
      if (rawHash) {
        try {
          // 解析偽裝成加密 Token 的 Base64 字串
          const decodedStr = decodeURIComponent(atob(rawHash));
          const newJob = JSON.parse(decodedStr);
          
          setJobs(prevJobs => {
            if (prevJobs.some(j => j.id === newJob.id)) return prevJobs; // 防止重複加入
            return [newJob, ...prevJobs]; // 將 AI 產生的資料放在最前面
          });

          // 讀取完畢後，把網址列清乾淨，看起來就像變魔術一樣
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (e) {
          console.error('Failed to parse synced job data:', e);
        }
      }
    };

    syncDataFromHash(); // 初次載入時執行
    window.addEventListener('hashchange', syncDataFromHash); // 監聽網址變化，確保已開啟的分頁也能秒速同步
    return () => window.removeEventListener('hashchange', syncDataFromHash);
  }, []);

  const handleJobClick = (job: JobApplication, tab: 'overview' | 'jd' | 'channels' | 'notes' = 'overview') => {
    setSelectedJob(job);
    setSidePanelTab(tab);
  };

  const handleStatusChangeRequest = (newStatus: JobStatus) => {
    setPendingStatus(newStatus);
    setIsModalOpen(true);
  };

  const confirmStatusChange = (data: any) => {
    if (selectedJob) {
      const updatedJobs = jobs.map(j => {
        if (j.id === selectedJob.id) {
          const updatedJob = { ...j, status: data.status };
          
          if (data.interview) {
            const existingRoundIndex = j.interviewTimeline.findIndex(r => r.name === data.interview.name);
            if (existingRoundIndex > -1) {
              // Update existing round
              const updatedTimeline = [...j.interviewTimeline];
              updatedTimeline[existingRoundIndex] = {
                ...updatedTimeline[existingRoundIndex],
                date: data.interview.date,
                time: data.interview.time,
                result: data.interview.result,
                quality: data.interview.quality || '--',
                notes: data.interview.notes
              };
              updatedJob.interviewTimeline = updatedTimeline;
            } else {
              // Add new round
              const newRound: InterviewRound = {
                id: `r${Date.now()}`,
                roundNumber: j.interviewTimeline.length + 1,
                name: data.interview.name,
                date: data.interview.date,
                time: data.interview.time,
                result: data.interview.result,
                quality: data.interview.quality || '--',
                notes: data.interview.notes
              };
              updatedJob.interviewTimeline = [...j.interviewTimeline, newRound];
            }
          }
          
          if (data.offer) {
            updatedJob.offerDetails = {
              salary: data.offer.salary,
              pto: data.offer.pto,
              bonus: data.offer.bonus,
              deadline: data.offer.deadline,
              decision: data.offer.decision || 'Pending',
              notes: data.offer.notes
            };
          }

          if (data.status === 'Rejected') {
            updatedJob.rejectedReason = data.rejectedReason;
            updatedJob.rejectedNotes = data.rejectedNotes;
          }
          
          return updatedJob;
        }
        return j;
      });
      
      setJobs(updatedJobs);
      const updatedSelectedJob = updatedJobs.find(j => j.id === selectedJob.id);
      if (updatedSelectedJob) setSelectedJob(updatedSelectedJob);
      
      // Feedback
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
    setIsModalOpen(false);
    setPendingStatus(null);
  };

  const activeStatuses: JobStatus[] = ['Applied', 'Screening', '1st Interview', '2nd Interview', '3rd Interview', 'Final Interview'];
  const archivedStatuses: JobStatus[] = ['Rejected'];
  const offerStatuses: JobStatus[] = ['Offer'];

  const getFilteredByView = (allJobs: JobApplication[], view: 'active' | 'archived' | 'offers') => {
    switch (view) {
      case 'active':
        return allJobs.filter(j => activeStatuses.includes(j.status));
      case 'archived':
        return allJobs.filter(j => archivedStatuses.includes(j.status));
      case 'offers':
        return allJobs.filter(j => offerStatuses.includes(j.status));
      default:
        return allJobs;
    }
  };

  const viewFilteredJobs = getFilteredByView(jobs, activeView);
  
  const filteredJobs = viewFilteredJobs.filter(job => {
    if (filters.status.length > 0 && !filters.status.includes(job.status)) return false;
    if (filters.channels.length > 0 && !filters.channels.some(c => job.selectedChannels.includes(c))) return false;
    if (filters.tags.length > 0 && !filters.tags.some(t => job.tags.includes(t))) return false;
    if (job.fitScore < filters.fitScore[0] || job.fitScore > filters.fitScore[1]) return false;
    if (filters.location.length > 0 && !filters.location.some(l => job.location.includes(l))) return false;
    if (filters.experience.length > 0 && !filters.experience.includes(job.experienceLevel)) return false;
    
    if (filters.highProbability && job.interviewProbability <= 0.5) return false;
    if (filters.lowROI && !(job.selectedChannels.length > 2 && job.interviewTimeline.length === 0)) return false;
    if (filters.needsFollowUp) {
      const lastResponse = job.lastResponseDate ? new Date(job.lastResponseDate) : new Date(job.appliedTime);
      const diffDays = (new Date().getTime() - lastResponse.getTime()) / (1000 * 3600 * 24);
      // For mock data, let's assume "needs follow up" means > 14 days since last response
      if (diffDays <= 14) return false;
    }
    
    return true;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const direction = sortConfig.direction === 'desc' ? 1 : -1;
    
    if (sortConfig.field === 'status') {
      if (statusOrder[b.status] !== statusOrder[a.status]) {
        return (statusOrder[b.status] - statusOrder[a.status]) * direction;
      }
      return new Date(b.appliedTime).getTime() - new Date(a.appliedTime).getTime();
    } else {
      const timeA = new Date(a.appliedTime).getTime();
      const timeB = new Date(b.appliedTime).getTime();
      if (timeB !== timeA) {
        return (timeB - timeA) * direction;
      }
      return statusOrder[b.status] - statusOrder[a.status];
    }
  });

  const counts = {
    active: getFilteredByView(jobs, 'active').length,
    archived: getFilteredByView(jobs, 'archived').length,
    offers: getFilteredByView(jobs, 'offers').length,
  };

  const removeFilter = (key: keyof FilterState, value?: any) => {
    setFilters(prev => {
      const next = { ...prev };
      if (Array.isArray(next[key])) {
        (next[key] as any) = (next[key] as any).filter((v: any) => v !== value);
      } else if (typeof next[key] === 'boolean') {
        (next[key] as any) = false;
      } else if (key === 'fitScore') {
        next.fitScore = [0, 100];
      }
      return next;
    });
  };

  const handleSort = (field: 'status' | 'appliedTime') => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {activePage === 'apps' ? (
        <div className="p-8 relative">
          {/* Feedback Toast */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 20 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2"
              >
                <CheckCircle2 size={20} />
                ✓ Saved successfully
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Command Center</h1>
                <p className="text-sm text-slate-500 mt-1">Manage and track your high-velocity job search.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm relative overflow-hidden">
                  <motion.div 
                    layoutId="active-view-bg"
                    className="absolute inset-y-1 bg-brand-50 rounded-md z-0"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    style={{
                      left: activeView === 'active' ? '4px' : activeView === 'archived' ? 'calc(33.33% + 2px)' : 'calc(66.66% + 2px)',
                      width: 'calc(33.33% - 4px)'
                    }}
                  />
                  <button 
                    onClick={() => setActiveView('active')}
                    className={cn(
                      "relative z-10 px-3 py-1 text-xs font-bold transition-colors duration-200",
                      activeView === 'active' ? "text-brand-600" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Active ({counts.active})
                  </button>
                  <button 
                    onClick={() => setActiveView('archived')}
                    className={cn(
                      "relative z-10 px-3 py-1 text-xs font-bold transition-colors duration-200",
                      activeView === 'archived' ? "text-brand-600" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Archived ({counts.archived})
                  </button>
                  <button 
                    onClick={() => setActiveView('offers')}
                    className={cn(
                      "relative z-10 px-3 py-1 text-xs font-bold transition-colors duration-200",
                      activeView === 'offers' ? "text-brand-600" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Offers ({counts.offers})
                  </button>
                </div>
                <FilterPanel 
                  filters={filters} 
                  onApply={setFilters} 
                  onReset={() => setFilters(initialFilters)} 
                />
              </div>
            </div>

            {/* Active Filters */}
            {(filters.status.length > 0 || filters.channels.length > 0 || filters.tags.length > 0 || filters.location.length > 0 || filters.experience.length > 0 || filters.highProbability || filters.lowROI || filters.needsFollowUp || filters.fitScore[0] > 0 || filters.fitScore[1] < 100) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Active Filters:</span>
                {filters.status.map(s => (
                  <button key={s} onClick={() => removeFilter('status', s)} className="flex items-center gap-1 px-2 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-bold border border-brand-100 hover:bg-brand-100 transition-colors">
                    Status: {s} <X size={10} />
                  </button>
                ))}
                {filters.channels.map(c => (
                  <button key={c} onClick={() => removeFilter('channels', c)} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors">
                    Channel: {c} <X size={10} />
                  </button>
                ))}
                {filters.tags.map(t => (
                  <button key={t} onClick={() => removeFilter('tags', t)} className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold border border-purple-100 hover:bg-purple-100 transition-colors">
                    Tag: {t} <X size={10} />
                  </button>
                ))}
                {filters.location.map(l => (
                  <button key={l} onClick={() => removeFilter('location', l)} className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold border border-slate-200 hover:bg-slate-200 transition-colors">
                    Location: {l} <X size={10} />
                  </button>
                ))}
                {filters.experience.map(e => (
                  <button key={e} onClick={() => removeFilter('experience', e)} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-white rounded-full text-[10px] font-bold hover:bg-slate-900 transition-colors">
                    Exp: {e} <X size={10} />
                  </button>
                ))}
                {(filters.fitScore[0] > 0 || filters.fitScore[1] < 100) && (
                  <button onClick={() => removeFilter('fitScore')} className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-100 hover:bg-amber-100 transition-colors">
                    Fit: {filters.fitScore[0]}% - {filters.fitScore[1]}% <X size={10} />
                  </button>
                )}
                {filters.highProbability && (
                  <button onClick={() => removeFilter('highProbability')} className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
                    High Prob <X size={10} />
                  </button>
                )}
                {filters.lowROI && (
                  <button onClick={() => removeFilter('lowROI')} className="flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold border border-rose-100 hover:bg-rose-100 transition-colors">
                    Low ROI <X size={10} />
                  </button>
                )}
                {filters.needsFollowUp && (
                  <button onClick={() => removeFilter('needsFollowUp')} className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-[10px] font-bold border border-orange-100 hover:bg-orange-100 transition-colors">
                    Needs Follow-up <X size={10} />
                  </button>
                )}
                <button onClick={() => setFilters(initialFilters)} className="text-[10px] font-bold text-slate-400 hover:text-brand-600 underline underline-offset-2 ml-2">
                  Clear All
                </button>
              </div>
            )}

            {/* Table Container */}
            <div className="glass-panel overflow-hidden">
              <JobTable 
                jobs={sortedJobs} 
                onJobClick={handleJobClick} 
                onStatusClick={(job) => {
                  setSelectedJob(job);
                  handleStatusChangeRequest(job.status);
                }}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          </div>

          {/* Side Panel */}
          <SidePanel 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
            onStatusChange={handleStatusChangeRequest}
            onUpdateJob={(updatedJob) => {
              setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
              setSelectedJob(updatedJob);
            }}
            initialTab={sidePanelTab}
          />

          {/* Status Confirmation Modal */}
          <StatusModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={confirmStatusChange}
            newStatus={pendingStatus || 'Applied'}
            job={selectedJob}
          />
        </div>
      ) : (
        <Dashboard jobs={jobs} />
      )}
    </Layout>
  );
}
