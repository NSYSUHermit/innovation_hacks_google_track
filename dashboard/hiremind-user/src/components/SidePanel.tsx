import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Calendar, Clock, Plus, Trash2, MessageSquare, Phone, Mail, User, CheckCircle2, AlertCircle, Briefcase, MapPin, Building2, ChevronRight, Globe, LayoutDashboard } from 'lucide-react';
import { JobApplication, JobStatus, InterviewRound, Note } from '../types';
import { cn } from '../lib/utils';
import { StatusBadge, TagBadge } from './Badges';

interface SidePanelProps {
  job: JobApplication | null;
  onClose: () => void;
  onStatusChange: (newStatus: JobStatus) => void;
  onUpdateJob: (updatedJob: JobApplication) => void;
  initialTab?: 'overview' | 'jd' | 'channels' | 'notes';
}

export default function SidePanel({ job, onClose, onStatusChange, onUpdateJob, initialTab = 'overview' }: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'jd' | 'channels' | 'notes'>(initialTab);

  // Update activeTab if initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'manual' | 'call' | 'email'>('manual');

  if (!job) return null;

  const handleAddTag = () => {
    if (newTag.trim()) {
      const updatedJob = { ...job, tags: [...job.tags, newTag.trim()] };
      onUpdateJob(updatedJob);
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedJob = { ...job, tags: job.tags.filter(t => t !== tagToRemove) };
    onUpdateJob(updatedJob);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jd', label: 'Job Description', icon: Briefcase },
    { id: 'channels', label: 'Channels', icon: Globe },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
  ];

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    
    const newNote: Note = {
      id: `n${Date.now()}`,
      content: newNoteContent.trim(),
      timestamp: new Date().toLocaleString(),
      type: newNoteType
    };

    const updatedJob = {
      ...job,
      notes: [newNote, ...job.notes]
    };
    onUpdateJob(updatedJob);
    setNewNoteContent('');
  };

  const toggleChannel = (channel: any) => {
    const isSelected = job.selectedChannels.includes(channel);
    const updatedChannels = isSelected 
      ? job.selectedChannels.filter(c => c !== channel)
      : [...job.selectedChannels, channel];
    
    onUpdateJob({ ...job, selectedChannels: updatedChannels });
  };

  const toggleReferral = () => {
    onUpdateJob({ ...job, referral: !job.referral });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center text-2xl font-bold text-slate-700 border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {job.company.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">{job.jobTitle}</h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1.5">
                  <span className="font-semibold text-slate-700">{job.company}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onStatusChange(job.status)}
              className="hover:scale-105 transition-transform"
            >
              <StatusBadge status={job.status} />
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex flex-wrap gap-2 items-center">
              {job.tags.map((t) => (
                <span key={t} className="px-3 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] text-slate-600 flex items-center gap-1 font-bold uppercase tracking-wider group">
                  {t} 
                  <button onClick={() => handleRemoveTag(t)}>
                    <X size={10} className="cursor-pointer text-slate-300 group-hover:text-rose-500 transition-colors" />
                  </button>
                </span>
              ))}
              
              {isAddingTag ? (
                <div className="flex items-center gap-1">
                  <input 
                    autoFocus
                    type="text" 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    onBlur={() => !newTag && setIsAddingTag(false)}
                    className="px-2 py-0.5 text-[10px] border border-brand-300 rounded-full focus:ring-1 focus:ring-brand-500 focus:border-brand-500 w-20 outline-none"
                    placeholder="Tag name..."
                  />
                  <button onClick={handleAddTag} className="text-brand-600 hover:text-brand-700">
                    <CheckCircle2 size={12} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingTag(true)}
                  className="px-2 py-0.5 rounded-full border border-dashed border-slate-400 text-slate-400 hover:border-brand-500 hover:text-brand-500 transition-colors text-[10px] font-bold flex items-center gap-1"
                >
                  <Plus size={10} /> Add Tag
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px flex items-center gap-2",
                activeTab === tab.id 
                  ? "border-brand-600 text-brand-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon size={16} className={cn(
                "transition-colors",
                activeTab === tab.id ? "text-brand-600" : "text-slate-400"
              )} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Offer Card (Critical Visibility) */}
              {job.status === 'Offer' && job.offerDetails && (
                <button 
                  onClick={() => onStatusChange('Offer')}
                  className="w-full text-left bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-sm animate-in zoom-in-95 duration-300 hover:border-emerald-400 transition-all group/offer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
                      <CheckCircle2 size={24} /> Offer Received 🎉
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-widest">
                        {job.offerDetails.decision}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover/offer:opacity-100 transition-opacity">Click to Edit</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-emerald-500/70 block mb-0.5">Annual Salary</label>
                      <p className="text-emerald-900 font-bold text-xl">{job.offerDetails.salary}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-emerald-500/70 block mb-0.5">Annual Leave (PTO)</label>
                      <p className="text-emerald-900 font-bold text-lg">{job.offerDetails.pto || '20 Days'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-emerald-500/70 block mb-0.5">Bonus</label>
                      <p className="text-emerald-900 font-bold text-lg">{job.offerDetails.bonus || '15%'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-emerald-500/70 block mb-0.5">Deadline</label>
                      <p className="text-emerald-900 font-bold text-lg">{job.offerDetails.deadline}</p>
                    </div>
                  </div>
                  
                  {job.offerDetails.notes && (
                    <div className="mt-4 pt-4 border-t border-emerald-200/50">
                      <label className="text-[10px] uppercase font-bold text-emerald-500/70 block mb-1">Negotiation & Benefits</label>
                      <p className="text-emerald-800 text-sm italic leading-relaxed">"{job.offerDetails.notes}"</p>
                    </div>
                  )}
                </button>
              )}

              {/* Interview Progress Summary */}
              {job.interviewTimeline.length > 0 && (
                <section className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Interview Progress</h3>
                  <div className="space-y-3">
                    {job.interviewTimeline.map((round) => (
                      <div key={round.id} className="flex items-center justify-between group cursor-pointer" onClick={() => {
                        const el = document.getElementById(`round-${round.id}`);
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                            round.result === 'Pass' ? "bg-emerald-100 text-emerald-600" : 
                            round.result === 'Fail' ? "bg-rose-100 text-rose-600" : "bg-slate-200 text-slate-500"
                          )}>
                            {round.result === 'Pass' ? '✔' : round.result === 'Fail' ? '✘' : '⏳'}
                          </div>
                          <span className="text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors">{round.name}</span>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                          round.result === 'Pass' ? "text-emerald-600" : 
                          round.result === 'Fail' ? "text-rose-600" : "text-slate-400"
                        )}>
                          {round.result}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Full Interview Timeline */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Interview Timeline</h3>
                </div>
                
                <div className="space-y-4">
                  {job.interviewTimeline.length > 0 ? (
                    job.interviewTimeline.map((round, idx) => (
                      <div key={round.id} id={`round-${round.id}`} className="relative pl-8 before:absolute before:left-3 before:top-8 before:bottom-0 before:w-px before:bg-slate-200 last:before:hidden">
                        <div className={cn(
                          "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white z-10",
                          round.result === 'Pass' ? "border-emerald-500 text-emerald-500" : 
                          round.result === 'Fail' ? "border-rose-500 text-rose-500" : "border-slate-300 text-slate-300"
                        )}>
                          {round.result === 'Pass' ? <CheckCircle2 size={12} /> : 
                           round.result === 'Fail' ? <AlertCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                        </div>
                        <button 
                          onClick={() => onStatusChange(round.name as JobStatus)}
                          className="glass-panel p-4 w-full text-left hover:border-brand-300 hover:shadow-md transition-all group/card"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-slate-900 group-hover/card:text-brand-600 transition-colors">{round.name}</h4>
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                              round.result === 'Pass' ? "bg-emerald-50 text-emerald-700" : 
                              round.result === 'Fail' ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-500"
                            )}>
                              {round.result}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                            <div className="flex items-center gap-1"><Calendar size={12} /> {round.date}</div>
                            <div className="flex items-center gap-1"><Clock size={12} /> {round.time}</div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 font-medium">Quality:</span>
                              <span className={cn(
                                "font-bold",
                                round.quality === 'Good Fit' ? "text-emerald-600" : 
                                round.quality === 'Weak Match' ? "text-amber-600" : "text-slate-600"
                              )}>{round.quality}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 italic leading-relaxed">"{round.notes}"</p>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                      <p className="text-sm text-slate-400">No interview rounds scheduled yet.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Rejection Details */}
              {job.status === 'Rejected' && (
                <div className="bg-rose-50 border-2 border-rose-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-lg mb-4">
                    <AlertCircle size={24} /> Rejection Analysis
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-rose-400 block mb-1 tracking-widest">Primary Reason</label>
                      <p className="text-rose-900 font-bold text-lg">{job.rejectedReason || 'Role Closed'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-rose-400 block mb-1 tracking-widest">Feedback & Notes</label>
                      <p className="text-rose-700 text-sm italic leading-relaxed">"{job.rejectedNotes || 'They decided to put the role on hold for the current quarter.'}"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'jd' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Industry</span>
                  <p className="text-sm font-medium text-slate-900">{job.industry}</p>
                </div>
                <div className="glass-panel p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Visa Info</span>
                  <p className="text-sm font-medium text-slate-900">{job.jobDescription.visaInfo || 'N/A'}</p>
                </div>
              </div>

              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Briefcase size={16} className="text-brand-500" /> Responsibilities
                </h3>
                <ul className="space-y-2">
                  {job.jobDescription.responsibilities.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-brand-400 mt-1.5 w-1 h-1 rounded-full bg-brand-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-brand-500" /> Requirements
                </h3>
                <ul className="space-y-2">
                  {job.jobDescription.requirements.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2">
                      <div className="w-4 h-4 rounded border border-slate-300 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-brand-500" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.jobDescription.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Channels Used</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['LinkedIn', 'Company Website', 'Indeed', 'Recruiter'].map((channel) => (
                    <button
                      key={channel}
                      onClick={() => toggleChannel(channel as any)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                        job.selectedChannels.includes(channel as any)
                          ? "bg-brand-50 border-brand-200 text-brand-700 shadow-sm"
                          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        job.selectedChannels.includes(channel as any)
                          ? "bg-brand-600 border-brand-600 text-white"
                          : "bg-slate-50 border-slate-200"
                      )}>
                        {job.selectedChannels.includes(channel as any) && <CheckCircle2 size={12} />}
                      </div>
                      <span className="text-sm font-bold">{channel}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Referral Status</h3>
                <button
                  onClick={toggleReferral}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                    job.referral
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                      : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      job.referral ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                    )}>
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Referral Application</p>
                      <p className="text-xs opacity-70">Did someone refer you for this role?</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    job.referral ? "bg-emerald-500" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      job.referral ? "left-7" : "left-1"
                    )} />
                  </div>
                </button>
              </section>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setNewNoteType('manual')}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      newNoteType === 'manual' ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200"
                    )}
                  >
                    Note
                  </button>
                  <button 
                    onClick={() => setNewNoteType('call')}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      newNoteType === 'call' ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200"
                    )}
                  >
                    Call
                  </button>
                  <button 
                    onClick={() => setNewNoteType('email')}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      newNoteType === 'email' ? "bg-purple-600 text-white" : "bg-white text-slate-500 border border-slate-200"
                    )}
                  >
                    Email
                  </button>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add a note..." 
                    className="flex-1 bg-white border-slate-200 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 outline-none p-2"
                  />
                  <button 
                    onClick={handleAddNote}
                    disabled={!newNoteContent.trim()}
                    className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {job.notes.map(note => (
                  <div key={note.id} className="flex gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      note.type === 'call' ? "bg-blue-50 text-blue-600" :
                      note.type === 'email' ? "bg-purple-50 text-purple-600" : "bg-slate-50 text-slate-600"
                    )}>
                      {note.type === 'call' ? <Phone size={14} /> :
                       note.type === 'email' ? <Mail size={14} /> : <MessageSquare size={14} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-900 capitalize">{note.type}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{note.timestamp}</span>
                      </div>
                      <div className="glass-panel p-3 text-sm text-slate-600 leading-relaxed">
                        {note.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-between items-center gap-4">
          <div className="flex flex-col flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Current Status</label>
            <select 
              className="w-full bg-white border-slate-200 rounded-md text-sm font-bold text-slate-700 focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
              value={job.status}
              onChange={(e) => onStatusChange(e.target.value as JobStatus)}
            >
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="1st Interview">1st Interview</option>
              <option value="2nd Interview">2nd Interview</option>
              <option value="3rd Interview">3rd Interview</option>
              <option value="Final Interview">Final Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <button className="btn-secondary gap-2 mt-4 shrink-0 hover:text-rose-600 hover:border-rose-200 font-bold">
            <Trash2 size={16} className="text-rose-500" />
            Mark as Closed
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
