import { Filter, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import {
  segmentPerformanceAIInsight,
  type SegmentPerformanceRow,
  type SegmentTrend,
} from "../data/mockData";

interface SegmentPerformanceTableProps {
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  segments: SegmentPerformanceRow[];
  /** Matches global KPI comparison hint (e.g. "Deltas vs last week"). */
  comparisonHintShort?: string;
}

function trendColor(t: SegmentTrend) {
  if (t === "↑") return "text-emerald-600 dark:text-emerald-400";
  if (t === "↓") return "text-red-600 dark:text-red-400";
  return "text-zinc-400 dark:text-zinc-500";
}

export function SegmentPerformanceTable({
  searchQuery,
  onSearchQueryChange,
  segments: segmentSource,
  comparisonHintShort,
}: SegmentPerformanceTableProps) {
  const [trendFilter, setTrendFilter] = useState<"All" | SegmentTrend>("All");

  const rows = useMemo(() => {
    const s = searchQuery.trim().toLowerCase();
    return segmentSource.filter((r) => {
      if (trendFilter !== "All" && r.trend !== trendFilter) return false;
      if (!s) return true;
      return r.segment.toLowerCase().includes(s);
    });
  }, [segmentSource, searchQuery, trendFilter]);

  return (
    <section className="glass-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border p-4 dark:border-zinc-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-navy dark:text-white">Platform Performance by Segment</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Aggregated outcomes across user segments — measuring platform effectiveness
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Showing {rows.length} of {segmentSource.length} segments
            </p>
            {comparisonHintShort ? (
              <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                KPI change badges use {comparisonHintShort}.
              </p>
            ) : null}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2 sm:max-w-xl sm:justify-end">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search segments…"
                className="w-full rounded-lg border border-border bg-white py-2 pl-8 pr-3 text-sm outline-none ring-brand-500/20 focus:border-brand-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                value={trendFilter}
                onChange={(e) => setTrendFilter(e.target.value as "All" | SegmentTrend)}
                className="appearance-none rounded-lg border border-border bg-brand-50 py-2 pl-8 pr-8 text-sm font-medium text-navy outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="All">All trends</option>
                <option value="↑">↑ Improving</option>
                <option value="→">→ Flat</option>
                <option value="↓">↓ Declining</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 rounded-lg border border-brand-200/80 bg-brand-50/70 p-3 dark:border-brand-500/20 dark:bg-brand-500/10">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
          <p className="text-xs leading-relaxed text-navy dark:text-zinc-200">
            <span className="font-semibold text-brand-700 dark:text-brand-300">AI Insight: </span>
            {segmentPerformanceAIInsight}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-zinc-50/80 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
              <th className="px-4 py-3">Segment</th>
              <th className="px-4 py-3">Total Applications</th>
              <th className="px-4 py-3">Avg Match Score</th>
              <th className="px-4 py-3">Interview Rate</th>
              <th className="px-4 py-3">Offer Rate</th>
              <th className="px-4 py-3">Avg Response Time (days)</th>
              <th className="px-4 py-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <SegmentRow key={row.segment} row={row} />
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="p-8 text-center text-sm text-zinc-500">No segments match your filters.</p>
      )}
    </section>
  );
}

function SegmentRow({ row }: { row: SegmentPerformanceRow }) {
  const m = row.matchScore;

  return (
    <tr className="border-b border-border transition hover:bg-brand-50/40 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
      <td className="px-4 py-3">
        <span className="font-medium text-navy dark:text-zinc-100">{row.segment}</span>
      </td>
      <td className="px-4 py-3 font-mono text-sm font-semibold tabular-nums text-navy dark:text-white">
        {row.applications.toLocaleString("en-US")}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tabular-nums text-navy dark:text-white">{m}</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-full rounded-full bg-semantic-green" style={{ width: `${m}%` }} />
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-sm font-semibold tabular-nums text-navy dark:text-white">
        {row.interviewRate}%
      </td>
      <td className="px-4 py-3 font-mono text-sm font-semibold tabular-nums text-navy dark:text-white">
        {row.offerRate}%
      </td>
      <td className="px-4 py-3 font-mono text-sm font-semibold tabular-nums text-navy dark:text-white">
        {row.responseTime.toFixed(1)}
      </td>
      <td className="px-4 py-3">
        <span className={`font-mono text-lg font-bold leading-none ${trendColor(row.trend)}`}>{row.trend}</span>
      </td>
    </tr>
  );
}
