import {
  employmentRateByDegree,
  employmentRateByMajor,
  employmentRateByUniversity,
  timeToJobByEducationLevel,
  type DegreeFilter,
  type MajorFilter,
} from "./mockData";

const SCHOOL_ID_TO_LABEL: Record<string, string> = {
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

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function blendEmploymentRate(schoolId: string, degree: DegreeFilter, major: MajorFilter): number {
  const parts: number[] = [];
  if (schoolId !== "all") {
    const label = SCHOOL_ID_TO_LABEL[schoolId];
    const u = employmentRateByUniversity.find((r) => r.school === label);
    if (u) parts.push(u.rate);
  }
  if (major !== "All") {
    const m = employmentRateByMajor.find((r) => r.major === major);
    if (m) parts.push(m.rate);
  }
  if (degree !== "All") {
    const d = employmentRateByDegree.find((r) => r.degree === degree);
    if (d) parts.push(d.rate);
  }
  if (parts.length === 0) return 72;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

function blendTimeToJob(schoolId: string, degree: DegreeFilter, major: MajorFilter): number {
  let tj = 3.2;
  if (degree !== "All") {
    const t = timeToJobByEducationLevel.find((x) => x.level === degree);
    if (t) tj = t.months;
  }
  if (major !== "All") {
    const stem = ["Computer Science", "Data Science", "Electrical Engineering"].includes(major);
    tj += stem ? -0.45 : major === "Business / MBA" || major === "Economics" ? 0.35 : 0.15;
  }
  if (schoolId !== "all" && ["mit", "stanford", "cmu", "berkeley"].includes(schoolId)) {
    tj -= 0.4;
  } else if (schoolId === "harvard") {
    tj += 0.2;
  }
  return Math.round(clamp(tj, 2.1, 5.8) * 10) / 10;
}

export type UniversityTopIndustry = { name: string; pct: number };

function buildTopIndustries(
  schoolId: string,
  degree: DegreeFilter,
  major: MajorFilter
): UniversityTopIndustry[] {
  let tech = 38;
  let fin = 22;
  let mkt = 14;

  if (major === "Computer Science" || major === "Data Science" || major === "Electrical Engineering") {
    tech += 20;
    fin -= 4;
    mkt -= 3;
  } else if (major === "Business / MBA" || major === "Economics") {
    tech -= 10;
    fin += 14;
    mkt += 2;
  } else if (major === "Psychology") {
    tech -= 8;
    fin -= 2;
    mkt += 10;
  } else if (major !== "All") {
    tech -= 4;
    mkt += 3;
  }

  if (degree === "PhD") {
    tech += 5;
    fin += 2;
  } else if (degree === "Bachelor") {
    tech -= 4;
    mkt += 5;
  }

  if (["mit", "stanford", "cmu", "gatech"].includes(schoolId)) {
    tech += 9;
    fin -= 2;
  } else if (schoolId === "harvard") {
    fin += 10;
    tech -= 5;
  } else if (schoolId === "berkeley" || schoolId === "utexas") {
    tech += 4;
  }

  const rows = [
    { name: "Tech", pct: clamp(tech, 10, 62) },
    { name: "Finance", pct: clamp(fin, 10, 48) },
    { name: "Marketing", pct: clamp(mkt, 8, 38) },
  ].sort((a, b) => b.pct - a.pct);
  const top2 = rows.slice(0, 2);
  const sum = top2.reduce((a, r) => a + r.pct, 0);
  return top2.map((r) => ({
    name: r.name,
    pct: Math.round((r.pct / sum) * 100),
  }));
}

function buildCohortNote(
  schoolId: string,
  degree: DegreeFilter,
  major: MajorFilter,
  er: number,
  months: number
): string {
  const scope =
    schoolId === "all"
      ? "National blended cohort"
      : `Focus: ${SCHOOL_ID_TO_LABEL[schoolId] ?? "selected school"}`;
  const filters: string[] = [];
  if (degree !== "All") filters.push(degree);
  if (major !== "All") filters.push(major);
  const filterBit =
    filters.length > 0 ? ` · Filters: ${filters.join(" + ")}` : " · No degree/major narrowing";
  return `${scope}${filterBit} · Modeled placement ~${er}% · median ${months} mo to offer.`;
}

export function getUniversitySummaryDetailed(
  schoolId: string,
  degree: DegreeFilter,
  major: MajorFilter
): {
  employmentRate: number;
  avgTimeToJob: number;
  topIndustries: UniversityTopIndustry[];
  cohortNote: string;
} {
  const employmentRate = Math.min(95, blendEmploymentRate(schoolId, degree, major));
  const avgTimeToJob = blendTimeToJob(schoolId, degree, major);
  const topIndustries = buildTopIndustries(schoolId, degree, major);
  const cohortNote = buildCohortNote(schoolId, degree, major, employmentRate, avgTimeToJob);
  return { employmentRate, avgTimeToJob, topIndustries, cohortNote };
}
