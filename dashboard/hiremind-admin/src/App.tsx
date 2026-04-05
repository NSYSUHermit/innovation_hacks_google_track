import { Download, Filter } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AIInsightsPanel } from "./components/AIInsightsPanel";
import { SegmentPerformanceTable } from "./components/SegmentPerformanceTable";
import {
  FunnelVisualization,
  IndustryBarChart,
  IndustryPieChart,
  UserGrowthChart,
} from "./components/DashboardCharts";
import { FiltersModal } from "./components/FiltersModal";
import { KpiCards } from "./components/KpiCards";
import { PageIntro } from "./components/PageIntro";
import { type NavId, Sidebar } from "./components/Sidebar";
import { SettingsPanel } from "./components/SettingsPanel";
import { TopNav } from "./components/TopNav";
import { UniversityRecruitment } from "./components/UniversityRecruitment";
import { UsersPanel } from "./components/UsersPanel";
import {
  COMPARISON_OPTIONS,
  DEFAULT_COMPARISON,
  DEFAULT_DATE_RANGE,
  DEFAULT_INDUSTRY,
  getDashboardSnapshot,
  type ComparisonPeriod,
  type DateRangeFilter,
  type IndustryFilter,
} from "./data/dashboardFilters";
import type { SegmentPerformanceRow } from "./data/mockData";

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 72;

function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("hiremind-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (stored !== "light" && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
  }, []);

  const toggle = useCallback(() => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("hiremind-theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return [dark, toggle] as const;
}

function downloadSegmentPerformanceCsv(rows: SegmentPerformanceRow[]) {
  const headers = [
    "segment",
    "totalApplications",
    "avgMatchScore",
    "interviewRate",
    "offerRate",
    "avgResponseTimeDays",
    "trend",
  ] as const;
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        `"${r.segment.replace(/"/g, '""')}"`,
        r.applications,
        r.matchScore,
        r.interviewRate,
        r.offerRate,
        r.responseTime,
        `"${r.trend}"`,
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hiremind-platform-performance-by-segment.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const pageCopy: Record<
  NavId,
  { title: string; subtitle: string }
> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Welcome back, Alex. Here's what's happening today.",
  },
  "ai-insights": {
    title: "AI Insights",
    subtitle: "Model-generated signals you can act on this week.",
  },
  users: {
    title: "Users",
    subtitle: "Manage access, roles, and activity across your workspace.",
  },
  applications: {
    title: "Applications",
    subtitle: "Track candidate pipeline health and recruiter throughput.",
  },
  settings: {
    title: "Settings",
    subtitle: "Workspace preferences, notifications, and security.",
  },
};

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, toggleDark] = useDarkMode();
  const [globalSearch, setGlobalSearch] = useState("");
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedIndustry, setAppliedIndustry] = useState<IndustryFilter>(DEFAULT_INDUSTRY);
  const [appliedDateRange, setAppliedDateRange] = useState<DateRangeFilter>(DEFAULT_DATE_RANGE);
  const [draftIndustry, setDraftIndustry] = useState<IndustryFilter>(DEFAULT_INDUSTRY);
  const [draftDateRange, setDraftDateRange] = useState<DateRangeFilter>(DEFAULT_DATE_RANGE);
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>(DEFAULT_COMPARISON);

  const sidebarW = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  const copy = pageCopy[activeNav];

  const dashboardSnapshot = useMemo(
    () => getDashboardSnapshot(appliedIndustry, appliedDateRange, comparisonPeriod),
    [appliedIndustry, appliedDateRange, comparisonPeriod]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-page dark:bg-[#0b0f14]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        active={activeNav}
        onNavigate={setActiveNav}
        onLogout={() => {
          window.alert("Logout is a demo action — wire to your auth provider.");
        }}
      />

      <div
        className="flex min-h-screen flex-col transition-[margin] duration-200"
        style={{ marginLeft: sidebarW }}
      >
        <TopNav
          darkMode={darkMode}
          onToggleDark={toggleDark}
          search={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        <main className="flex-1 px-4 pb-10 pt-6 lg:px-6">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <PageIntro title={copy.title} subtitle={copy.subtitle} />
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">
                <label className="sr-only" htmlFor="comparison-period">
                  Comparison period for KPI changes
                </label>
                <select
                  id="comparison-period"
                  value={comparisonPeriod}
                  onChange={(e) => setComparisonPeriod(e.target.value as ComparisonPeriod)}
                  className="max-w-[min(100vw-2rem,220px)] rounded-[12px] border border-border bg-white py-2 pl-3 pr-8 text-xs font-medium text-navy shadow-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  title="Basis for KPI change indicators"
                >
                  {COMPARISON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setDraftIndustry(appliedIndustry);
                    setDraftDateRange(appliedDateRange);
                    setFiltersOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-[12px] border border-border bg-brand-50 px-3 py-2 text-sm font-medium text-navy transition hover:bg-brand-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <button
                  type="button"
                  onClick={() => downloadSegmentPerformanceCsv(dashboardSnapshot.segments)}
                  className="inline-flex items-center gap-1.5 rounded-[12px] bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {activeNav === "dashboard" && (
              <div className="grid grid-cols-12 gap-4 lg:gap-5">
                <div className="col-span-12">
                  <KpiCards kpi={dashboardSnapshot.kpi} />
                </div>
                <div className="col-span-12 xl:col-span-8">
                  <UserGrowthChart
                    userGrowth={dashboardSnapshot.userGrowth}
                    growthSubtitle={dashboardSnapshot.growthSubtitle}
                  />
                </div>
                <div className="col-span-12 xl:col-span-4">
                  <FunnelVisualization funnel={dashboardSnapshot.funnel} funnelSub={dashboardSnapshot.funnelSub} />
                </div>
                <div className="col-span-12 lg:col-span-7">
                  <IndustryBarChart applicationsByIndustry={dashboardSnapshot.applicationsByIndustry} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                  <IndustryPieChart industrySharePie={dashboardSnapshot.industrySharePie} />
                </div>
                <div className="col-span-12">
                  <AIInsightsPanel />
                </div>
                <div className="col-span-12">
                  <UniversityRecruitment />
                </div>
                <div className="col-span-12">
                  <SegmentPerformanceTable
                    searchQuery={globalSearch}
                    onSearchQueryChange={setGlobalSearch}
                    segments={dashboardSnapshot.segments}
                    comparisonHintShort={dashboardSnapshot.comparisonHintShort}
                  />
                </div>
              </div>
            )}

            {activeNav === "ai-insights" && (
              <div className="grid grid-cols-12 gap-4 lg:gap-5">
                <div className="col-span-12">
                  <AIInsightsPanel />
                </div>
                <div className="col-span-12">
                  <UniversityRecruitment />
                </div>
              </div>
            )}

            {activeNav === "users" && (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <UsersPanel />
                </div>
              </div>
            )}

            {activeNav === "applications" && (
              <div className="grid grid-cols-12 gap-4 lg:gap-5">
                <div className="col-span-12">
                  <KpiCards kpi={dashboardSnapshot.kpi} />
                </div>
                <div className="col-span-12">
                  <SegmentPerformanceTable
                    searchQuery={globalSearch}
                    onSearchQueryChange={setGlobalSearch}
                    segments={dashboardSnapshot.segments}
                    comparisonHintShort={dashboardSnapshot.comparisonHintShort}
                  />
                </div>
              </div>
            )}

            {activeNav === "settings" && <SettingsPanel />}
          </div>
        </main>
      </div>

      <FiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        draftIndustry={draftIndustry}
        draftDateRange={draftDateRange}
        onDraftIndustryChange={setDraftIndustry}
        onDraftDateRangeChange={setDraftDateRange}
        onApply={() => {
          setAppliedIndustry(draftIndustry);
          setAppliedDateRange(draftDateRange);
        }}
        onReset={() => {
          setAppliedIndustry(DEFAULT_INDUSTRY);
          setAppliedDateRange(DEFAULT_DATE_RANGE);
        }}
      />
    </div>
  );
}
