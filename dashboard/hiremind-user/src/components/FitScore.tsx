import React from 'react';
import { cn } from '../lib/utils';
import { Popover, PopoverContent, PopoverTrigger, PopoverArrow } from './ui/popover';

interface FitScoreProps {
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    industry: number;
    visa: number;
    gap: string;
  };
}

export default function FitScore({ score, breakdown }: FitScoreProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const getColor = (s: number) => {
    if (s >= 90) return 'bg-emerald-500';
    if (s >= 75) return 'bg-brand-500';
    if (s >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger 
        className="flex flex-col gap-1 w-24 cursor-help group text-left"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <div className="flex justify-between items-center">
          <span className={cn("text-xs font-bold font-mono", score >= 75 ? "text-emerald-600" : "text-slate-600")}>
            {score}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-500", getColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="start" 
        sideOffset={12}
        className="w-80 p-0 bg-slate-900 border-slate-800 text-white shadow-2xl rounded-xl overflow-hidden z-[100] max-h-[70vh] overflow-y-auto"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4">
          <div className="font-bold mb-3 border-b border-slate-700 pb-2 flex justify-between items-center">
            <span className="text-sm">AI Fit Breakdown</span>
            <span className="text-[10px] bg-brand-500 px-1.5 py-0.5 rounded uppercase tracking-wider">Verified</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold">
                <span>Skills Match</span>
                <span>{breakdown.skills}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${breakdown.skills}%` }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold">
                <span>Experience Alignment</span>
                <span>{breakdown.experience}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500" style={{ width: `${breakdown.experience}%` }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold">
                <span>Industry Relevance</span>
                <span>{breakdown.industry}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${breakdown.industry}%` }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold">
                <span>Visa Compatibility</span>
                <span className={cn(breakdown.visa < 50 ? "text-rose-400" : "text-emerald-400")}>{breakdown.visa}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full", breakdown.visa < 50 ? "bg-rose-500" : "bg-emerald-500")} style={{ width: `${breakdown.visa}%` }} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 text-slate-300 italic leading-relaxed text-xs">
              <span className="text-brand-400 font-bold not-italic mr-1">AI Insight:</span>
              {breakdown.gap}
            </div>
          </div>
        </div>
        <PopoverArrow className="fill-slate-900 stroke-slate-800" />
      </PopoverContent>
    </Popover>
  );
}
