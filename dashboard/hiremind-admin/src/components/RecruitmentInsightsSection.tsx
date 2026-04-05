import { Building2, Download, GitCompare, Sparkles, Target } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { buildRecruitmentInsightsCsv } from "../data/universityRecruitmentExport";
import {
  companyMatchThresholds,
  crossEmployerCandidate,
  matchScoreVsResponseRate,
  recruitmentAIInsights,
  recruitmentInsights,
} from "../data/mockData";
import { downloadCsv } from "../utils/csvDownload";

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid #e3e8ee",
  borderRadius: "8px",
  fontSize: "12px",
};

const thresholdChartData = companyMatchThresholds.map((c) => ({
  name: c.company.length > 14 ? c.company.slice(0, 12) + "…" : c.company,
  full: c.company,
  minMatch: c.minMatch,
  type: c.companyType,
}));

export function RecruitmentInsightsSection() {
  const handleExportRecruitment = () => {
    downloadCsv("hiremind-recruitment-insights.csv", buildRecruitmentInsightsCsv());
  };

  return (
    <div className="col-span-12 space-y-4">
      <div className="glass-panel p-4 lg:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-600" />
            <div>
              <h3 className="text-sm font-semibold text-navy dark:text-white">Recruitment insights</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Match thresholds, cross-employer comparison, and response curves
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportRecruitment}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-[12px] border border-border bg-brand-50 px-3 py-2 text-sm font-medium text-navy transition hover:bg-brand-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <dl className="mb-6 grid grid-cols-1 gap-3 border-b border-border pb-6 sm:grid-cols-3 dark:border-zinc-800">
          <div className="rounded-lg border border-border bg-brand-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <dt className="text-xs text-zinc-500">Time-to-hire</dt>
            <dd className="font-mono text-xl font-semibold text-navy dark:text-white">
              {recruitmentInsights.timeToHireDays}{" "}
              <span className="text-xs font-medium text-zinc-500">days</span>
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-brand-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <dt className="text-xs text-zinc-500">Candidate quality score</dt>
            <dd className="font-mono text-xl font-semibold text-navy dark:text-white">
              {recruitmentInsights.qualityScore}{" "}
              <span className="text-xs font-medium text-zinc-500">/ 10</span>
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-brand-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <dt className="text-xs text-zinc-500">Best source</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-800 dark:bg-brand-500/20 dark:text-brand-200">
                {recruitmentInsights.bestSource.name}
              </span>
              <span className="font-mono font-semibold">{recruitmentInsights.bestSource.pct}%</span>
            </dd>
          </div>
        </dl>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6 glass-panel border border-border p-4 dark:border-zinc-800">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-brand-600" />
              <h4 className="text-xs font-semibold text-navy dark:text-white">Minimum match score by employer</h4>
            </div>
            <p className="text-[11px] text-zinc-500">
              Typical bar for first-round human review — e.g. Google ~90, startups ~65–70
            </p>
            <div className="mt-3 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={thresholdChartData} margin={{ left: 0, right: 12, bottom: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-22} textAnchor="end" height={56} />
                  <YAxis domain={[60, 95]} tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [`${v}`, "Min match"]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.full ? String(payload[0].payload.full) : ""
                    }
                  />
                  <ReferenceLine y={90} stroke="#dc534d" strokeDasharray="4 4" />
                  <ReferenceLine y={70} stroke="#57b885" strokeDasharray="4 4" />
                  <Bar dataKey="minMatch" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">
              Reference lines: <span className="text-red-600">~90</span> Big Tech bar ·{" "}
              <span className="text-emerald-600">~70</span> startup bar
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
              {companyMatchThresholds.slice(0, 4).map((c) => (
                <li key={c.company} className="flex justify-between font-mono">
                  <span className="font-sans text-zinc-700 dark:text-zinc-300">{c.company}</span>
                  <span>
                    ≥{c.minMatch} <span className="text-zinc-400">({c.companyType})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 lg:col-span-6 glass-panel border border-border p-4 dark:border-zinc-800">
            <div className="mb-2 flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-brand-600" />
              <h4 className="text-xs font-semibold text-navy dark:text-white">Same candidate, different employers</h4>
            </div>
            <p className="mb-3 text-[11px] text-zinc-500">
              {crossEmployerCandidate.name} · {crossEmployerCandidate.role} · {crossEmployerCandidate.baseSkills}
            </p>
            <div className="overflow-x-auto rounded-lg border border-border dark:border-zinc-800">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-zinc-50/80 text-[10px] font-semibold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <th className="px-3 py-2">Employer</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Match</th>
                    <th className="px-3 py-2">Typical bar</th>
                    <th className="px-3 py-2">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {crossEmployerCandidate.rows.map((r) => {
                    const meets = r.match >= r.minBar;
                    return (
                      <tr key={r.employer} className="border-b border-border dark:border-zinc-800">
                        <td className="px-3 py-2 font-medium text-navy dark:text-zinc-100">{r.employer}</td>
                        <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{r.companyType}</td>
                        <td className="px-3 py-2 font-mono font-semibold">{r.match}</td>
                        <td className="px-3 py-2 font-mono text-zinc-500">{r.minBar}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              meets
                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                            }`}
                          >
                            {r.response}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              Above bar does not guarantee progression—teams still weigh team fit and role-specific signals.
            </p>
          </div>

          <div className="col-span-12 glass-panel border border-border p-4 dark:border-zinc-800">
            <h4 className="text-xs font-semibold text-navy dark:text-white">Match score vs. response rate</h4>
            <p className="text-[11px] text-zinc-500">
              Aggregate employer response rate (any human touch) by match-score band — higher match, higher reply
              likelihood
            </p>
            <div className="mt-3 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ left: 8, right: 16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
                  <XAxis
                    type="number"
                    dataKey="match"
                    name="Match"
                    domain={[55, 98]}
                    tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                    label={{ value: "Match score", position: "bottom", offset: 0, fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="responseRate"
                    name="Response %"
                    domain={[0, 50]}
                    tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                    label={{ value: "Response rate %", angle: -90, position: "insideLeft", fontSize: 11 }}
                  />
                  <ZAxis type="number" range={[60, 60]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name: string) => [
                      name === "responseRate" ? `${value}%` : value,
                      name === "responseRate" ? "Response rate" : "Match",
                    ]}
                  />
                  <Scatter name="Cohort" data={matchScoreVsResponseRate} fill="#6366f1" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-3">
          {recruitmentAIInsights.map((ins) => (
            <div
              key={ins.title}
              className={`col-span-12 rounded-[12px] border p-4 md:col-span-4 ${
                ins.accent === "blue"
                  ? "border-blue-200/80 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/30"
                  : ins.accent === "violet"
                    ? "border-violet-200/80 bg-violet-50/70 dark:border-violet-900/50 dark:bg-violet-950/30"
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
      </div>
    </div>
  );
}
