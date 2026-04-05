import { BookOpen, Download, GraduationCap, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildUniversityAnalyticsCsv } from "../data/universityRecruitmentExport";
import { getUniversitySummaryDetailed } from "../data/universityKpiData";
import {
  degreeFilterOptions,
  employmentRateByDegree,
  employmentRateByMajor,
  employmentRateByUniversity,
  majorFilterOptions,
  timeToJobByEducationLevel,
  type DegreeFilter,
  type MajorFilter,
  universityAIInsights,
  usUniversities,
} from "../data/mockData";
import { downloadCsv } from "../utils/csvDownload";

const SCHOOL_ID_TO_CHART_LABEL: Record<string, string> = {
  mit: "MIT",
  stanford: "Stanford",
  berkeley: "UC Berkeley",
  cmu: "CMU",
  harvard: "Harvard",
  umich: "UMich",
  utexas: "UT Austin",
  uw: "UW",
  gatech: "Georgia Tech",
};

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid #e3e8ee",
  borderRadius: "8px",
  fontSize: "12px",
};

export function UniversityAnalyticsSection() {
  const [schoolId, setSchoolId] = useState<string>("all");
  const [degree, setDegree] = useState<DegreeFilter>("All");
  const [major, setMajor] = useState<MajorFilter>("All");

  /** University chart: school filter only (degree/major do not rescale this chart). */
  const uniBars = useMemo(() => {
    if (schoolId === "all") return employmentRateByUniversity;
    const label = SCHOOL_ID_TO_CHART_LABEL[schoolId];
    const one = employmentRateByUniversity.find((r) => r.school === label);
    return one ? [one] : employmentRateByUniversity.slice(0, 1);
  }, [schoolId]);

  /** Degree chart: only the degree filter applies — show one level or all three. */
  const degreeBars = useMemo(() => {
    if (degree === "All") return employmentRateByDegree;
    const row = employmentRateByDegree.find((d) => d.degree === degree);
    return row ? [row] : employmentRateByDegree;
  }, [degree]);

  /** Major chart: only the major filter applies — show one field or all. */
  const majorBars = useMemo(() => {
    if (major === "All") return employmentRateByMajor;
    const row = employmentRateByMajor.find((m) => m.major === major);
    return row ? [row] : employmentRateByMajor;
  }, [major]);

  /** Time-to-job: optional filter by selected degree (same control as degree chart). */
  const timeLine = useMemo(() => {
    if (degree === "All") return timeToJobByEducationLevel;
    return timeToJobByEducationLevel.filter((t) => t.level === degree);
  }, [degree]);

  const summary = useMemo(
    () => getUniversitySummaryDetailed(schoolId, degree, major),
    [schoolId, degree, major]
  );

  const handleExportUniversity = () => {
    const csv = buildUniversityAnalyticsCsv({
      filters: { schoolId, degree, major },
      university: uniBars,
      degree: degreeBars,
      major: majorBars,
      timeToJob: timeLine,
      summary,
    });
    downloadCsv("hiremind-university-analytics.csv", csv);
  };

  return (
    <div className="col-span-12 space-y-4">
      <div className="glass-panel p-4 lg:p-5">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 shrink-0 text-brand-600" />
            <div>
              <h3 className="text-sm font-semibold text-navy dark:text-white">University analytics</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Campus pipeline — employment & time-to-job by institution and education
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              School
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="min-w-[200px] rounded-[12px] border border-border bg-white px-3 py-2 text-sm font-medium text-navy outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {usUniversities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Degree level
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value as DegreeFilter)}
                className="min-w-[140px] rounded-[12px] border border-border bg-white px-3 py-2 text-sm font-medium outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-900"
              >
                {degreeFilterOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Major
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value as MajorFilter)}
                className="min-w-[180px] rounded-[12px] border border-border bg-white px-3 py-2 text-sm font-medium outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-900"
              >
                {majorFilterOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleExportUniversity}
              className="inline-flex items-center gap-1.5 rounded-[12px] border border-border bg-brand-50 px-3 py-2 text-sm font-medium text-navy transition hover:bg-brand-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-brand-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Employment rate</p>
            <p className="mt-1 font-mono text-2xl font-bold text-navy dark:text-white">{summary.employmentRate}%</p>
            <p className="mt-0.5 text-[10px] text-zinc-500">Cohort estimate (school → major → degree)</p>
          </div>
          <div className="rounded-lg border border-border bg-brand-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Avg time to job</p>
            <p className="mt-1 font-mono text-2xl font-bold text-navy dark:text-white">
              {summary.avgTimeToJob} <span className="text-sm font-semibold text-zinc-500">mo</span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-brand-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Top industries</p>
            <ul className="mt-1 space-y-1 text-xs text-navy dark:text-zinc-200">
              {summary.topIndustries.map((row) => (
                <li key={row.name} className="flex justify-between font-mono">
                  <span className="font-sans font-medium">{row.name}</span> {row.pct}%
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-brand-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Cohort note</p>
            <p className="mt-1 text-xs leading-snug text-zinc-600 dark:text-zinc-400">{summary.cohortNote}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6 glass-panel border border-border p-4 dark:border-zinc-800">
            <h4 className="text-xs font-semibold text-navy dark:text-white">Employment rate by university</h4>
            <p className="text-[11px] text-zinc-500">
              6-month placed % — filtered by <span className="font-medium text-zinc-600 dark:text-zinc-400">school</span> only
            </p>
            <div className="mt-3 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uniBars} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
                  <YAxis type="category" dataKey="school" width={88} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [`${v}%`, "Employed"]}
                  />
                  <Bar dataKey="rate" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 glass-panel border border-border p-4 dark:border-zinc-800">
            <h4 className="text-xs font-semibold text-navy dark:text-white">Employment rate by degree</h4>
            <p className="text-[11px] text-zinc-500">
              {degree === "All"
                ? "Bachelor vs Master vs PhD — all levels"
                : `Showing only: ${degree} (use degree filter above)`}
            </p>
            <div className="mt-3 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={degreeBars} margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" vertical={false} />
                  <XAxis dataKey="degree" tick={{ fontSize: 11 }} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Employed"]} />
                  <Bar dataKey="rate" fill="#4f7ffb" radius={[6, 6, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 glass-panel border border-border p-4 dark:border-zinc-800">
            <h4 className="text-xs font-semibold text-navy dark:text-white">Employment rate by major</h4>
            <p className="text-[11px] text-zinc-500">
              {major === "All"
                ? "All tracked fields of study"
                : `Showing only: ${major} (use major filter above)`}
            </p>
            <div className="mt-3 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={majorBars} margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" vertical={false} />
                  <XAxis dataKey="major" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={64} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Employed"]} />
                  <Bar dataKey="rate" fill="#57b885" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 glass-panel border border-border p-4 dark:border-zinc-800">
            <h4 className="text-xs font-semibold text-navy dark:text-white">Time-to-job by education level</h4>
            <p className="text-[11px] text-zinc-500">
              {degree === "All"
                ? "Median months to signed offer — all levels"
                : `Median months for ${degree} cohort only (linked to degree filter)`}
            </p>
            <div className="mt-3 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeLine} margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" vertical={false} />
                  <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                    label={{ value: "Months", angle: -90, position: "insideLeft", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [`${v} mo`, "Median"]}
                  />
                  <Line type="monotone" dataKey="months" stroke="#eaa234" strokeWidth={2.5} dot={{ r: 4, fill: "#eaa234" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-3">
          {universityAIInsights.map((ins) => (
            <div
              key={ins.title}
              className={`col-span-12 rounded-[12px] border p-4 md:col-span-4 ${
                ins.accent === "violet"
                  ? "border-violet-200/80 bg-violet-50/70 dark:border-violet-900/50 dark:bg-violet-950/30"
                  : ins.accent === "amber"
                    ? "border-amber-200/80 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/25"
                    : "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/30"
              }`}
            >
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <div>
                  <p className="text-sm font-semibold text-navy dark:text-zinc-100">{ins.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{ins.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2 rounded-lg border border-semantic-amber/30 bg-amber-50/80 p-3 dark:border-amber-900/40 dark:bg-amber-950/25">
          <BookOpen className="h-4 w-4 shrink-0 text-semantic-amber" />
          <p className="text-xs leading-relaxed text-amber-950 dark:text-amber-100">
            <span className="font-semibold">Curriculum AI: </span>
            CS & DS majors show the largest lift from adding SQL + one shipped project—recommend module bundles aligned to your selected major filter.
          </p>
        </div>
      </div>
    </div>
  );
}
