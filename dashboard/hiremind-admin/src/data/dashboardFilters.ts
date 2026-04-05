import {
  applicationsByIndustry as baseApplicationsByIndustry,
  funnelSteps as baseFunnel,
  kpiConfig as baseKpi,
  segmentPerformanceRows as baseSegments,
  userGrowth as baseUserGrowth,
} from "./mockData";
import type { SegmentPerformanceRow } from "./mockData";

export type IndustryFilter = "All" | "Tech" | "Finance" | "Marketing" | "Design" | "Operations";
export type DateRangeFilter = "7d" | "30d" | "3m" | "6m" | "12m";

/** Global KPI delta basis: current window vs prior window (mock deltas). */
export type ComparisonPeriod = "day" | "week" | "month" | "quarter" | "year";

export const DEFAULT_INDUSTRY: IndustryFilter = "All";
export const DEFAULT_DATE_RANGE: DateRangeFilter = "6m";
export const DEFAULT_COMPARISON: ComparisonPeriod = "week";

export const COMPARISON_OPTIONS: { value: ComparisonPeriod; label: string }[] = [
  { value: "day", label: "Today vs Yesterday" },
  { value: "week", label: "This Week vs Last Week" },
  { value: "month", label: "This Month vs Last Month" },
  { value: "quarter", label: "This Quarter vs Last Quarter" },
  { value: "year", label: "This Year vs Last Year" },
];

/** Short label shown next to each KPI delta (e.g. "vs last week"). */
export const COMPARISON_VS_LABEL: Record<ComparisonPeriod, string> = {
  day: "vs yesterday",
  week: "vs last week",
  month: "vs last month",
  quarter: "vs last quarter",
  year: "vs last year",
};

/** Hint appended to chart subtitles for trend context. */
export function shortComparisonHint(period: ComparisonPeriod): string {
  const map: Record<ComparisonPeriod, string> = {
    day: "Deltas vs yesterday",
    week: "Deltas vs last week",
    month: "Deltas vs last month",
    quarter: "Deltas vs last quarter",
    year: "Deltas vs last year",
  };
  return map[period];
}

/**
 * Mock signed deltas per comparison window (count = % change, rates = pp).
 * Negative = down vs prior period. Keys match kpiConfig ids.
 */
const KPI_DELTAS: Record<ComparisonPeriod, Record<string, { pct?: number; pp?: number }>> = {
  day: {
    seekers: { pct: 12 },
    active: { pct: 4 },
    apps: { pct: 14 },
    interview: { pp: 2 },
    offer: { pp: -1 },
  },
  week: {
    seekers: { pct: 5 },
    active: { pct: 5 },
    apps: { pct: 6 },
    interview: { pp: 1 },
    offer: { pp: 0 },
  },
  month: {
    seekers: { pct: 18 },
    active: { pct: 7 },
    apps: { pct: 18 },
    interview: { pp: 2 },
    offer: { pp: -1 },
  },
  quarter: {
    seekers: { pct: 8 },
    active: { pct: 4 },
    apps: { pct: 11 },
    interview: { pp: 2 },
    offer: { pp: 1 },
  },
  year: {
    seekers: { pct: 22 },
    active: { pct: 9 },
    apps: { pct: 15 },
    interview: { pp: -1 },
    offer: { pp: -1 },
  },
};

function appendComparisonHint(base: string, period: ComparisonPeriod): string {
  return `${base} · ${shortComparisonHint(period)}`;
}

const RANGE_SCALE: Record<DateRangeFilter, number> = {
  "7d": 0.08,
  "30d": 0.28,
  "3m": 0.55,
  "6m": 1.0,
  "12m": 1.12,
};

const INDUSTRY_VOLUME: Record<IndustryFilter, number> = {
  All: 1,
  Tech: 1.1,
  Finance: 0.95,
  Marketing: 0.9,
  Design: 0.85,
  Operations: 0.8,
};

export type KpiItem = {
  id: string;
  label: string;
  value: number;
  /** Absolute delta magnitude: percentage points for rates, whole % for counts. */
  change: number;
  /** Count metrics: % change vs prior period. Rate metrics: pp change. */
  deltaUnit: "pct" | "pp";
  /** True when delta is exactly zero (neutral badge). */
  deltaFlat: boolean;
  up: boolean;
  spark: number[];
  suffix?: "%";
  /** e.g. "vs last week" — always shown with the delta. */
  comparisonVs: string;
};

function round(n: number) {
  return Math.round(n);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function segmentIndustryBoost(segment: string, industry: IndustryFilter): number {
  if (industry === "All") return 1;
  const s = segment.toLowerCase();
  if (industry === "Tech") {
    if (s.includes("tech") || s.includes("ai-assisted") || s.includes("master")) return 1.14;
    if (s.includes("without ai")) return 0.92;
    return 0.9;
  }
  if (industry === "Finance" && s.includes("finance")) return 1.16;
  if (industry === "Marketing" && s.includes("marketing")) return 1.16;
  if (industry === "Design" && (s.includes("marketing") || s.includes("tech"))) return 1.08;
  if (industry === "Operations" && (s.includes("bachelor") || s.includes("master"))) return 1.08;
  return 0.88;
}

function scaleSegments(
  rows: readonly SegmentPerformanceRow[],
  industry: IndustryFilter,
  range: DateRangeFilter
): SegmentPerformanceRow[] {
  const rs = RANGE_SCALE[range];
  return rows.map((r) => {
    const boost = segmentIndustryBoost(r.segment, industry);
    const apps = Math.max(120, round(r.applications * rs * boost));
    const matchScore = clamp(round(r.matchScore + (industry === "Tech" && r.segment.includes("AI") ? 1 : 0) + (range === "7d" ? -1 : 0)), 55, 94);
    const interviewRate = clamp(round(r.interviewRate * (0.92 + 0.08 * boost)), 8, 35);
    const offerRate = clamp(round(r.offerRate * (0.9 + 0.1 * boost)), 2, 14);
    const responseTime = clamp(Number((r.responseTime * (1.05 - 0.05 * boost)).toFixed(1)), 3.5, 9.5);
    return {
      segment: r.segment,
      applications: apps,
      matchScore,
      interviewRate,
      offerRate,
      responseTime,
      trend: r.trend,
    };
  });
}

function applyComparisonDeltas(
  items: Omit<KpiItem, "change" | "deltaUnit" | "deltaFlat" | "up" | "comparisonVs">[],
  period: ComparisonPeriod,
  industry: IndustryFilter,
  range: DateRangeFilter
): KpiItem[] {
  const vs = COMPARISON_VS_LABEL[period];
  const vf = RANGE_SCALE[range] * INDUSTRY_VOLUME[industry];
  const rangeAdj = 0.75 + 0.25 * Math.min(vf, 1.2);
  const indAdj =
    industry === "All" ? 1 : industry === "Tech" ? 1.04 : industry === "Finance" ? 1.02 : 0.97;
  return items.map((item) => {
    const row = KPI_DELTAS[period][item.id];
    const isRate = item.suffix === "%";
    const raw = isRate
      ? Math.round(((row.pp ?? 0) * rangeAdj * indAdj) * 10) / 10
      : Math.round((row.pct ?? 0) * rangeAdj * indAdj);
    const deltaFlat = raw === 0;
    const up = raw > 0;
    return {
      ...item,
      change: Math.abs(raw),
      deltaUnit: isRate ? "pp" : "pct",
      deltaFlat,
      up,
      comparisonVs: vs,
    };
  });
}

function buildKpi(industry: IndustryFilter, range: DateRangeFilter, period: ComparisonPeriod): KpiItem[] {
  const vf = RANGE_SCALE[range] * INDUSTRY_VOLUME[industry];
  const pctAdjust = 0.88 + 0.12 * Math.min(1.2, vf);

  const items = baseKpi.map((k) => {
    const baseVal = k.value;
    const scaled =
      k.suffix === "%"
        ? clamp(round(baseVal * pctAdjust + (industry === "Tech" && k.id === "interview" ? 0.8 : 0)), 4, 42)
        : round(baseVal * vf);
    const ratio = baseVal === 0 ? 1 : scaled / baseVal;
    const spark = k.spark.map((p) => round(p * ratio));
    return {
      id: k.id,
      label: k.label,
      value: scaled,
      spark,
      suffix: k.suffix,
    };
  });
  return applyComparisonDeltas(items, period, industry, range);
}

function buildFunnel(industry: IndustryFilter, range: DateRangeFilter) {
  const vf = RANGE_SCALE[range] * INDUSTRY_VOLUME[industry];
  return baseFunnel.map((step) => ({
    ...step,
    value: Math.max(40, round(step.value * vf)),
  }));
}

const INDUSTRY_BAR_FILLS = ["#6366f1", "#4f7ffb", "#57b885", "#eaa234", "#dc534d"] as const;

export type ApplicationsByIndustryRow = { industry: string; value: number };
export type IndustrySharePieRow = { name: string; value: number; fill: string };

function buildApplicationsByIndustry(
  industry: IndustryFilter,
  range: DateRangeFilter
): ApplicationsByIndustryRow[] {
  const vf = RANGE_SCALE[range] * INDUSTRY_VOLUME[industry];
  return baseApplicationsByIndustry.map((row) => {
    const boost = industry === "All" ? 1 : row.industry === industry ? 1.28 : 0.72;
    return {
      industry: row.industry,
      value: Math.max(80, round(row.value * vf * boost)),
    };
  });
}

function buildIndustrySharePie(industry: IndustryFilter, range: DateRangeFilter): IndustrySharePieRow[] {
  const rows = buildApplicationsByIndustry(industry, range);
  return rows.map((r, i) => ({
    name: r.industry,
    value: r.value,
    fill: INDUSTRY_BAR_FILLS[i] ?? INDUSTRY_BAR_FILLS[0],
  }));
}

/** Growth chart labels + points scale with range; baseline 6m matches mockData. */
function buildUserGrowth(industry: IndustryFilter, range: DateRangeFilter) {
  const vf = RANGE_SCALE[range] * INDUSTRY_VOLUME[industry];
  const templates: Record<DateRangeFilter, { label: string; t: number }[]> = {
    "7d": [
      { label: "Mon", t: 0 },
      { label: "Tue", t: 0.15 },
      { label: "Wed", t: 0.28 },
      { label: "Thu", t: 0.42 },
      { label: "Fri", t: 0.55 },
      { label: "Sat", t: 0.68 },
      { label: "Sun", t: 1 },
    ],
    "30d": [
      { label: "W1", t: 0 },
      { label: "W2", t: 0.22 },
      { label: "W3", t: 0.48 },
      { label: "W4", t: 0.72 },
      { label: "W5", t: 1 },
    ],
    "3m": [
      { label: "W1", t: 0 },
      { label: "W4", t: 0.25 },
      { label: "W8", t: 0.5 },
      { label: "W12", t: 1 },
    ],
    "6m": baseUserGrowth.map((d, i, arr) => ({
      label: d.month,
      t: i / Math.max(1, arr.length - 1),
    })),
    "12m": [
      { label: "Jan", t: 0 },
      { label: "Feb", t: 0.09 },
      { label: "Mar", t: 0.18 },
      { label: "Apr", t: 0.27 },
      { label: "May", t: 0.36 },
      { label: "Jun", t: 0.45 },
      { label: "Jul", t: 0.54 },
      { label: "Aug", t: 0.63 },
      { label: "Sep", t: 0.72 },
      { label: "Oct", t: 0.81 },
      { label: "Nov", t: 0.9 },
      { label: "Dec", t: 1 },
    ],
  };

  const series = templates[range];
  const firstU = baseUserGrowth[0].users;
  const lastU = baseUserGrowth[baseUserGrowth.length - 1].users;
  return series.map((p) => ({
    month: p.label,
    users: Math.max(800, round((firstU + (lastU - firstU) * p.t) * vf)),
  }));
}

export function growthChartSubtitle(range: DateRangeFilter): string {
  const map: Record<DateRangeFilter, string> = {
    "7d": "Registered job seekers — last 7 days",
    "30d": "Registered job seekers — last 30 days",
    "3m": "Registered job seekers — last 3 months",
    "6m": "Registered job seekers — last 6 months",
    "12m": "Registered job seekers — last 12 months",
  };
  return map[range];
}

export function funnelSubtitle(range: DateRangeFilter): string {
  const map: Record<DateRangeFilter, string> = {
    "7d": "Signups → applied → interview → offer (last 7 days)",
    "30d": "Signups → applied → interview → offer (last 30 days)",
    "3m": "Signups → applied → interview → offer (last 3 months)",
    "6m": "Signups → applied → interview → offer",
    "12m": "Signups → applied → interview → offer (last 12 months)",
  };
  return map[range];
}

export interface DashboardSnapshot {
  kpi: KpiItem[];
  userGrowth: { month: string; users: number }[];
  funnel: { name: string; value: number; fill: string }[];
  segments: SegmentPerformanceRow[];
  applicationsByIndustry: ApplicationsByIndustryRow[];
  industrySharePie: IndustrySharePieRow[];
  growthSubtitle: string;
  funnelSub: string;
  /** Same basis as KPI deltas (for copy in other panels). */
  comparisonHintShort: string;
}

export function getDashboardSnapshot(
  industry: IndustryFilter,
  range: DateRangeFilter,
  comparisonPeriod: ComparisonPeriod = DEFAULT_COMPARISON
): DashboardSnapshot {
  return {
    kpi: buildKpi(industry, range, comparisonPeriod),
    userGrowth: buildUserGrowth(industry, range),
    funnel: buildFunnel(industry, range),
    segments: scaleSegments(baseSegments, industry, range),
    applicationsByIndustry: buildApplicationsByIndustry(industry, range),
    industrySharePie: buildIndustrySharePie(industry, range),
    growthSubtitle: appendComparisonHint(growthChartSubtitle(range), comparisonPeriod),
    funnelSub: appendComparisonHint(funnelSubtitle(range), comparisonPeriod),
    comparisonHintShort: shortComparisonHint(comparisonPeriod),
  };
}
