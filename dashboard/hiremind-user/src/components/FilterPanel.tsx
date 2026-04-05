import React, { useState } from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Button, buttonVariants } from './ui/button';
import { JobStatus, Channel, Tag, FilterState } from '../types';
import { cn } from '../lib/utils';

interface FilterPanelProps {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: JobStatus[] = [
  'Applied', 'Screening', '1st Interview', '2nd Interview', 
  '3rd Interview', 'Final Interview', 'Offer', 'Rejected'
];

const CHANNEL_OPTIONS: Channel[] = ['LinkedIn', 'Company Website', 'Indeed', 'Recruiter'];
const TAG_OPTIONS: Tag[] = ['High Priority', 'Recommended', 'Ghosted', 'Follow-up'];
const EXPERIENCE_OPTIONS = ['Junior', 'Mid', 'Senior'];
const LOCATION_OPTIONS = ['San Francisco', 'New York', 'Remote'];

export default function FilterPanel({ filters, onApply, onReset }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleStatus = (status: JobStatus) => {
    setLocalFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleToggleChannel = (channel: Channel) => {
    setLocalFilters(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleToggleTag = (tag: Tag) => {
    setLocalFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleToggleLocation = (loc: string) => {
    setLocalFilters(prev => ({
      ...prev,
      location: prev.location.includes(loc)
        ? prev.location.filter(l => l !== loc)
        : [...prev.location, loc]
    }));
  };

  const handleToggleExperience = (exp: string) => {
    setLocalFilters(prev => ({
      ...prev,
      experience: prev.experience.includes(exp)
        ? prev.experience.filter(e => e !== exp)
        : [...prev.experience, exp]
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    onReset();
    setLocalFilters({
      status: [],
      channels: [],
      tags: [],
      fitScore: [0, 100],
      location: [],
      experience: [],
      highProbability: false,
      lowROI: false,
      needsFollowUp: false
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className={cn(buttonVariants({ variant: "outline" }), "gap-2 border-slate-200 hover:bg-slate-50")}>
        <Filter size={16} />
        Filters
        {(filters.status.length > 0 || filters.channels.length > 0 || filters.tags.length > 0 || filters.location.length > 0 || filters.experience.length > 0 || filters.highProbability || filters.lowROI || filters.needsFollowUp) && (
          <span className="ml-1 w-2 h-2 bg-brand-500 rounded-full" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-2xl border-slate-200 rounded-2xl overflow-hidden" align="end">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Filters</h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-8 custom-scrollbar">
          {/* Status */}
          <section>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status}`} 
                    checked={localFilters.status.includes(status)}
                    onCheckedChange={() => handleToggleStatus(status)}
                  />
                  <Label htmlFor={`status-${status}`} className="text-xs font-medium text-slate-600 cursor-pointer">
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </section>

          {/* Channels */}
          <section>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Channels</h4>
            <div className="grid grid-cols-2 gap-2">
              {CHANNEL_OPTIONS.map(channel => (
                <div key={channel} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`channel-${channel}`} 
                    checked={localFilters.channels.includes(channel)}
                    onCheckedChange={() => handleToggleChannel(channel)}
                  />
                  <Label htmlFor={`channel-${channel}`} className="text-xs font-medium text-slate-600 cursor-pointer">
                    {channel}
                  </Label>
                </div>
              ))}
            </div>
          </section>

          {/* Tags */}
          <section>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all",
                    localFilters.tags.includes(tag)
                      ? "bg-brand-50 border-brand-200 text-brand-700"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Fit Score */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fit Score</h4>
              <span className="text-[10px] font-mono text-brand-600 font-bold">
                {localFilters.fitScore[0]}% - {localFilters.fitScore[1]}%
              </span>
            </div>
            <Slider 
              defaultValue={localFilters.fitScore} 
              max={100} 
              step={1} 
              onValueChange={(val) => setLocalFilters(prev => ({ ...prev, fitScore: val as [number, number] }))}
              className="mt-2"
            />
          </section>

          {/* Location */}
          <section>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Location</h4>
            <div className="space-y-2">
              {LOCATION_OPTIONS.map(loc => (
                <div key={loc} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`loc-${loc}`} 
                    checked={localFilters.location.includes(loc)}
                    onCheckedChange={() => handleToggleLocation(loc)}
                  />
                  <Label htmlFor={`loc-${loc}`} className="text-xs font-medium text-slate-600 cursor-pointer">
                    {loc}
                  </Label>
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Experience</h4>
            <div className="flex gap-2">
              {EXPERIENCE_OPTIONS.map(exp => (
                <button
                  key={exp}
                  onClick={() => handleToggleExperience(exp)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                    localFilters.experience.includes(exp)
                      ? "bg-slate-800 border-slate-800 text-white"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {exp}
                </button>
              ))}
            </div>
          </section>

          {/* Advanced */}
          <section>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Advanced</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-prob" className="text-xs font-medium text-slate-600">High success probability</Label>
                <Switch 
                  id="high-prob" 
                  checked={localFilters.highProbability}
                  onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, highProbability: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="low-roi" className="text-xs font-medium text-slate-600">Low ROI jobs</Label>
                <Switch 
                  id="low-roi" 
                  checked={localFilters.lowROI}
                  onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, lowROI: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="needs-follow" className="text-xs font-medium text-slate-600">Needs follow-up</Label>
                <Switch 
                  id="needs-follow" 
                  checked={localFilters.needsFollowUp}
                  onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, needsFollowUp: checked }))}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-slate-500 hover:text-slate-700 gap-2"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            Reset
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-100"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
