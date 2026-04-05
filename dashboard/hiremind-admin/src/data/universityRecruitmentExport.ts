import {
  companyMatchThresholds,
  crossEmployerCandidate,
  matchScoreVsResponseRate,
  recruitmentInsights,
} from "./mockData";
import { rowsToCsv } from "../utils/csvDownload";

export function buildUniversityAnalyticsCsv(opts: {
  filters: { schoolId: string; degree: string; major: string };
  university: { school: string; rate: number }[];
  degree: { degree: string; rate: number }[];
  major: { major: string; rate: number }[];
  timeToJob: { level: string; months: number }[];
  summary: {
    employmentRate: number;
    avgTimeToJob: number;
    topIndustries?: { name: string; pct: number }[];
  };
}): string {
  const parts: string[] = [];
  parts.push("# HireMind — University analytics export");
  parts.push(`# Filters: school=${opts.filters.schoolId}, degree=${opts.filters.degree}, major=${opts.filters.major}`);
  parts.push("");
  parts.push("# Summary KPIs");
  const summaryRows: (string | number)[][] = [
    ["employmentRate_pct", opts.summary.employmentRate],
    ["avgTimeToJob_months", opts.summary.avgTimeToJob],
  ];
  if (opts.summary.topIndustries?.length) {
    opts.summary.topIndustries.forEach((t, i) => {
      summaryRows.push([`topIndustry_${i + 1}_name`, t.name]);
      summaryRows.push([`topIndustry_${i + 1}_pct`, t.pct]);
    });
  }
  parts.push(rowsToCsv(["metric", "value"], summaryRows));
  parts.push("");
  parts.push("# Employment rate by university");
  parts.push(rowsToCsv(["school", "employmentRate_pct"], opts.university.map((r) => [r.school, r.rate])));
  parts.push("");
  parts.push("# Employment rate by degree");
  parts.push(rowsToCsv(["degree", "employmentRate_pct"], opts.degree.map((r) => [r.degree, r.rate])));
  parts.push("");
  parts.push("# Employment rate by major");
  parts.push(rowsToCsv(["major", "employmentRate_pct"], opts.major.map((r) => [r.major, r.rate])));
  parts.push("");
  parts.push("# Time to job by education level");
  parts.push(rowsToCsv(["level", "medianMonths"], opts.timeToJob.map((r) => [r.level, r.months])));
  return parts.join("\n");
}

export function buildRecruitmentInsightsCsv(): string {
  const parts: string[] = [];
  parts.push("# HireMind — Recruitment insights export");
  parts.push("");
  parts.push("# Summary");
  parts.push(
    rowsToCsv(["metric", "value"], [
      ["timeToHire_days", recruitmentInsights.timeToHireDays],
      ["candidateQualityScore", recruitmentInsights.qualityScore],
      ["bestSource_pct", recruitmentInsights.bestSource.pct],
      ["bestSource_name", recruitmentInsights.bestSource.name],
    ])
  );
  parts.push("");
  parts.push("# Minimum match score by employer");
  parts.push(
    rowsToCsv(
      ["company", "companyType", "minMatchScore"],
      companyMatchThresholds.map((c) => [c.company, c.companyType, c.minMatch])
    )
  );
  parts.push("");
  parts.push("# Cross-employer comparison (example cohort)");
  parts.push(
    rowsToCsv(
      ["candidateRole", "employer", "companyType", "match", "typicalBar", "outcome"],
      crossEmployerCandidate.rows.map((r) => [
        crossEmployerCandidate.role,
        r.employer,
        r.companyType,
        r.match,
        r.minBar,
        r.response,
      ])
    )
  );
  parts.push("");
  parts.push("# Match score vs response rate (aggregate)");
  parts.push(rowsToCsv(["matchScore", "responseRate_pct"], matchScoreVsResponseRate.map((r) => [r.match, r.responseRate])));
  return parts.join("\n");
}
