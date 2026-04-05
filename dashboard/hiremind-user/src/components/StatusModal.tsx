import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { JobStatus, JobApplication } from '../types';
import { cn } from '../lib/utils';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  newStatus: JobStatus;
  job: JobApplication | null;
}

export default function StatusModal({ isOpen, onClose, onConfirm, newStatus, job }: StatusModalProps) {
  const [result, setResult] = useState<'Pass' | 'Fail' | 'Pending'>('Pending');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [quality, setQuality] = useState<'Good Fit' | 'Weak Match' | 'Unexpected' | '--'>('--');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  
  // Offer fields
  const [salary, setSalary] = useState('');
  const [pto, setPto] = useState('');
  const [bonus, setBonus] = useState('');
  const [deadline, setDeadline] = useState('');
  const [decision, setDecision] = useState<'Accept' | 'Decline' | 'Pending'>('Pending');
  const [offerNotes, setOfferNotes] = useState('');

  // Rejected fields
  const [rejectedReason, setRejectedReason] = useState('Skill Gap (Technical)');
  const [rejectedNotes, setRejectedNotes] = useState('');

  // Pre-fill data if editing
  React.useEffect(() => {
    if (isOpen && job) {
      if (newStatus.includes('Interview')) {
        const existingRound = job.interviewTimeline.find(r => r.name === newStatus);
        if (existingRound) {
          setResult(existingRound.result);
          setDate(existingRound.date);
          setTime(existingRound.time);
          setQuality(existingRound.quality);
          setNotes(existingRound.notes);
          setShowNotes(!!existingRound.notes);
        } else {
          // Reset to defaults for new interview
          setResult('Pending');
          setDate(new Date().toISOString().split('T')[0]);
          setTime('10:00');
          setQuality('--');
          setNotes('');
          setShowNotes(false);
        }
      } else if (newStatus === 'Offer') {
        if (job.offerDetails) {
          setSalary(job.offerDetails.salary);
          setPto(job.offerDetails.pto || '');
          setBonus(job.offerDetails.bonus || '');
          setDeadline(job.offerDetails.deadline);
          setDecision(job.offerDetails.decision);
          setOfferNotes(job.offerDetails.notes || '');
        } else {
          setSalary('');
          setPto('');
          setBonus('');
          setDeadline('');
          setDecision('Pending');
          setOfferNotes('');
        }
      } else if (newStatus === 'Rejected') {
        setRejectedReason(job.rejectedReason || 'Skill Gap (Technical)');
        setRejectedNotes(job.rejectedNotes || '');
      }
    }
  }, [isOpen, newStatus, job]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const data: any = { status: newStatus };
    if (newStatus.includes('Interview')) {
      data.interview = {
        name: newStatus,
        date,
        time,
        result,
        quality,
        notes
      };
    } else if (newStatus === 'Offer') {
      data.offer = {
        salary,
        pto,
        bonus,
        deadline,
        decision,
        notes: offerNotes
      };
    } else if (newStatus === 'Rejected') {
      data.rejectedReason = rejectedReason;
      data.rejectedNotes = rejectedNotes;
    }
    onConfirm(data);
  };

  const isInterview = newStatus.includes('Interview');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className={cn(
            "p-5 text-white flex items-center justify-between shrink-0",
            newStatus === 'Rejected' ? "bg-rose-600" :
            newStatus === 'Offer' ? "bg-emerald-600" : "bg-slate-800"
          )}>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">Update Status</h3>
              <span className="text-white/60">→</span>
              <span className="text-white font-bold bg-white/20 px-2 py-0.5 rounded text-sm">{newStatus}</span>
            </div>
            {isInterview && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded">
                {newStatus} (auto)
              </span>
            )}
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {newStatus === 'Rejected' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rejection Reason</label>
                  <select 
                    value={rejectedReason}
                    onChange={(e) => setRejectedReason(e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm font-medium p-2.5 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  >
                    <option>Skill Gap (Technical)</option>
                    <option>Cultural Fit</option>
                    <option>Role Closed / Headcount Frozen</option>
                    <option>Better Candidate Found</option>
                    <option>Compensation Mismatch</option>
                    <option>Unknown / Ghosted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Internal Notes</label>
                  <textarea 
                    value={rejectedNotes}
                    onChange={(e) => setRejectedNotes(e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 h-24 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                    placeholder="What can we improve for the next application?"
                  />
                </div>
              </div>
            )}

            {isInterview && (
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Result</label>
                  <div className="flex gap-2">
                    {(['Pass', 'Fail', 'Pending'] as const).map(r => (
                      <button 
                        key={r} 
                        onClick={() => setResult(r)}
                        className={cn(
                          "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border-2",
                          result === r 
                            ? (r === 'Pass' ? "bg-emerald-500 border-emerald-500 text-white shadow-md" : 
                               r === 'Fail' ? "bg-rose-500 border-rose-500 text-white shadow-md" : 
                               "bg-slate-500 border-slate-500 text-white shadow-md")
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Calendar size={12} /> Date
                    </label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Clock size={12} /> Time
                    </label>
                    <input 
                      type="time" 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Interview Quality</label>
                  <div className="flex flex-wrap gap-2">
                    {(['Good Fit', 'Weak Match', 'Unexpected', '--'] as const).map(q => (
                      <button 
                        key={q} 
                        onClick={() => setQuality(q)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border-2 uppercase tracking-wider",
                          quality === q 
                            ? "bg-brand-600 border-brand-600 text-white shadow-md"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <button 
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    {showNotes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    Interview Notes (optional)
                  </button>
                  {showNotes && (
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full mt-2 bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 h-20 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all animate-in fade-in slide-in-from-top-2"
                      placeholder="Key questions, feedback, or areas for improvement..."
                    />
                  )}
                </div>
              </div>
            )}

            {newStatus === 'Offer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Salary</label>
                    <input 
                      type="text" 
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 font-bold text-slate-900" 
                      placeholder="$150,000" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">PTO</label>
                    <input 
                      type="text" 
                      value={pto}
                      onChange={(e) => setPto(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 font-bold text-slate-900" 
                      placeholder="20 Days" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bonus</label>
                    <input 
                      type="text" 
                      value={bonus}
                      onChange={(e) => setBonus(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 font-bold text-slate-900" 
                      placeholder="15%" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</label>
                    <input 
                      type="date" 
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 font-bold text-slate-900" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Decision</label>
                  <div className="flex gap-2">
                    {(['Accept', 'Decline', 'Pending'] as const).map(d => (
                      <button 
                        key={d} 
                        onClick={() => setDecision(d)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border-2 uppercase tracking-widest",
                          decision === d 
                            ? (d === 'Accept' ? "bg-emerald-600 border-emerald-600 text-white shadow-md" : 
                               d === 'Decline' ? "bg-rose-600 border-rose-600 text-white shadow-md" : 
                               "bg-slate-600 border-slate-600 text-white shadow-md")
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notes</label>
                  <textarea 
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 h-20 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Negotiation, conditions, extra benefits..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              className={cn(
                "flex-1 px-4 py-2.5 text-white text-xs font-bold rounded-lg transition-all shadow-lg uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0",
                newStatus === 'Rejected' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-100" : 
                newStatus === 'Offer' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : 
                "bg-slate-800 hover:bg-slate-900 shadow-slate-200"
              )}
            >
              Confirm & Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
