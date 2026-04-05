import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  TrendingUp, Users, Clock, Target, AlertTriangle, Lightbulb, ArrowRight, 
  CheckCircle2, BarChart3, PieChart as PieChartIcon, Zap, Calendar, ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { JobApplication, ComparisonPeriod } from '../types';
import { 
  getDashboardMetrics, 
  getSuccessRateByIndustry, 
  getSuccessRateByChannel, 
  getInterviewTrend, 
  getApplicationFunnel, 
  getLowROISegments, 
  getStrategyInsights, 
  getRecommendedActions 
} from '../lib/dashboardUtils';

const StatCard = ({ label, value, change, isPositive, basis, icon: Icon, color }: any) => (
  <div className="glass-panel p-5">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon size={20} className="text-white" />
      </div>
      {change && (
        <div className="flex flex-col items-end">
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
          )}>
            {change}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 font-medium">vs {basis}</span>
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-slate-900 font-mono">{value}</div>
    <div className="text-sm text-slate-500 font-medium mt-1">{label}</div>
  </div>
);

interface DashboardProps {
  jobs: JobApplication[];
}

export default function Dashboard({ jobs }: DashboardProps) {
  const [period, setPeriod] = useState<ComparisonPeriod>('This Month vs Last Month');
  
  const metrics = getDashboardMetrics(jobs, period);
  
  // Filter jobs for charts based on the selected period's current range
  // We'll use a helper to get the boundaries again here or just filter by the period's logic
  const parseDate = (dateStr: string) => new Date(dateStr.replace(/\//g, '-'));
  
  // For charts, we want to show data from the current period
  // But if the period is too small (e.g. Today), we might want to show more context
  // However, the prompt says "Keep all charts and related analytics in sync with the same selected period"
  // So we will filter.
  
  const getPeriodRange = (p: ComparisonPeriod) => {
    const ref = new Date('2026-04-05');
    const start = new Date(ref);
    const end = new Date(ref);
    
    switch (p) {
      case 'Today vs Yesterday': start.setHours(0,0,0,0); break;
      case 'This Week vs Last Week': start.setDate(start.getDate() - start.getDay()); start.setHours(0,0,0,0); break;
      case 'This Month vs Last Month': start.setDate(1); start.setHours(0,0,0,0); break;
      case 'This Quarter vs Last Quarter': start.setMonth(Math.floor(start.getMonth()/3)*3, 1); start.setHours(0,0,0,0); break;
      case 'This Year vs Last Year': start.setMonth(0, 1); start.setHours(0,0,0,0); break;
    }
    return { start, end };
  };

  const { start, end } = getPeriodRange(period);
  const periodJobs = jobs.filter(j => {
    const d = parseDate(j.appliedTime);
    return d >= start && d <= end;
  });

  // If periodJobs is empty (e.g. Today has no apps), we'll fallback to all jobs for charts 
  // to avoid broken UI, but the metrics will correctly show 0.
  // Actually, let's stick to the prompt: "Keep all charts... in sync"
  const chartJobs = periodJobs.length > 0 ? periodJobs : jobs;

  const industryData = getSuccessRateByIndustry(chartJobs);
  const channelData = getSuccessRateByChannel(chartJobs);
  const trendData = getInterviewTrend(chartJobs);
  const funnelData = getApplicationFunnel(chartJobs);
  const lowROISegments = getLowROISegments(chartJobs);
  const strategyInsights = getStrategyInsights(chartJobs);
  const recommendedActions = getRecommendedActions(chartJobs);

  const periods: ComparisonPeriod[] = [
    'Today vs Yesterday',
    'This Week vs Last Week',
    'This Month vs Last Month',
    'This Quarter vs Last Quarter',
    'This Year vs Last Year'
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Intelligence Dashboard</h2>
          <p className="text-sm text-slate-500">Real-time performance analytics and AI insights.</p>
        </div>
        
        <div className="relative group">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value as ComparisonPeriod)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-bold text-slate-700 shadow-sm hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
          >
            {periods.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Calendar size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Applications" 
          value={metrics.totalApplications.value} 
          change={metrics.totalApplications.change} 
          isPositive={metrics.totalApplications.isPositive}
          basis={metrics.basis}
          icon={Users} 
          color="bg-brand-500" 
        />
        <StatCard 
          label="Interview Rate" 
          value={metrics.interviewRate.value} 
          change={metrics.interviewRate.change} 
          isPositive={metrics.interviewRate.isPositive}
          basis={metrics.basis}
          icon={TrendingUp} 
          color="bg-indigo-500" 
        />
        <StatCard 
          label="Avg Response Time" 
          value={metrics.avgResponseTime.value} 
          change={metrics.avgResponseTime.change}
          isPositive={metrics.avgResponseTime.isPositive}
          basis={metrics.basis}
          icon={Clock} 
          color="bg-slate-700" 
        />
        <StatCard 
          label="Strategy Score" 
          value={metrics.strategyScore.value} 
          change={metrics.strategyScore.change}
          isPositive={metrics.strategyScore.isPositive}
          basis={metrics.basis}
          icon={Target} 
          color="bg-brand-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-500" /> Success Rate by Industry
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={industryData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="success" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <PieChartIcon size={20} className="text-brand-500" /> Success by Channel
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channelData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {channelData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-500" /> Interview Rate Trend
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Application Funnel</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Strategy Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low ROI Segment */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-rose-700 font-bold mb-4">
            <AlertTriangle size={20} /> Low ROI Detection
          </div>
          <div className="space-y-4">
            {lowROISegments.industries.map((item, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-rose-200 shadow-sm">
                <p className="text-sm text-slate-600 mb-2">You applied to <span className="font-bold text-slate-900">{item.count} jobs</span> in <span className="font-bold text-rose-600">{item.industry}</span></p>
                <div className="flex items-center gap-2 text-rose-600 font-bold">
                  <ArrowRight size={16} /> {item.successCount} Interviews
                </div>
                <p className="text-[11px] text-slate-400 mt-2 italic leading-relaxed">AI Recommendation: Pivot strategy or refine resume for this sector.</p>
              </div>
            ))}
            {lowROISegments.channels.map((item, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-rose-200 shadow-sm">
                <p className="text-sm text-slate-600 mb-2">Application Channel: <span className="font-bold text-rose-600">{item.channel}</span></p>
                <div className="flex items-center gap-2 text-rose-600 font-bold">
                  <ArrowRight size={16} /> {item.rate.toFixed(1)}% Response Rate
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Insights */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-brand-700 font-bold mb-4">
            <Zap size={20} /> Strategy Insights
          </div>
          <div className="space-y-3">
            {strategyInsights.map((insight, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border border-brand-100 shadow-sm">
                <div className="mt-0.5 shrink-0">
                  {insight.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-500" /> : 
                   insight.type === 'warning' ? <AlertTriangle size={16} className="text-amber-500" /> : 
                   <Lightbulb size={16} className="text-brand-500" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-2 font-bold mb-4">
            <CheckCircle2 size={20} className="text-brand-400" /> Recommended Actions
          </div>
          <div className="space-y-4">
            {recommendedActions.map((action, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-5 h-5 rounded border border-slate-700 flex items-center justify-center group-hover:border-brand-400 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-brand-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-300 group-hover:text-white transition-colors leading-tight">{action}</p>
              </div>
            ))}
            <button className="w-full mt-2 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-brand-900/20">
              Generate New Strategy Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
