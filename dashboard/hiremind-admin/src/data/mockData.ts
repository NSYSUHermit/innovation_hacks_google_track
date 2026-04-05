export const platformStats = {
  users: 12450,
  activeUsers: 3240,
  applications: 28300,
  interviewRate: 18,
  offerRate: 6,
  industries: {
    Tech: 9200,
    Finance: 5400,
    Marketing: 4100,
    Design: 2100,
    Operations: 1500,
  },
} as const;

export const kpiConfig = [
  {
    id: "seekers",
    label: "Total Job Seekers",
    value: 12450,
    change: 12,
    up: true,
    spark: [8200, 9100, 9800, 10500, 11200, 11800, 12450],
  },
  {
    id: "active",
    label: "Active Users",
    value: 3240,
    change: 5,
    up: true,
    spark: [2400, 2580, 2700, 2850, 2980, 3120, 3240],
  },
  {
    id: "apps",
    label: "Total Applications",
    value: 28300,
    change: 18,
    up: true,
    spark: [18200, 19800, 21500, 23200, 24800, 26500, 28300],
  },
  {
    id: "interview",
    label: "Interview Rate",
    value: 18,
    suffix: "%",
    change: 2,
    up: true,
    spark: [14, 15, 15, 16, 17, 17, 18],
  },
  {
    id: "offer",
    label: "Offer Rate",
    value: 6,
    suffix: "%",
    change: 1,
    up: false,
    spark: [8, 7.5, 7.2, 6.8, 6.5, 6.2, 6],
  },
] as const;

export const userGrowth = [
  { month: "Jan", users: 4000 },
  { month: "Feb", users: 5200 },
  { month: "Mar", users: 6800 },
  { month: "Apr", users: 8500 },
  { month: "May", users: 10200 },
  { month: "Jun", users: 12450 },
];

export const funnelSteps = [
  { name: "Signups", value: 12450, fill: "#6366f1" },
  { name: "Applied", value: 8200, fill: "#7c93e8" },
  { name: "Interview", value: 2200, fill: "#9eb4ef" },
  { name: "Offer", value: 750, fill: "#c7d4f7" },
];

export const applicationsByIndustry = [
  { industry: "Tech", value: 9200 },
  { industry: "Finance", value: 5400 },
  { industry: "Marketing", value: 4100 },
  { industry: "Design", value: 2100 },
  { industry: "Operations", value: 1500 },
];

export const industrySharePie = applicationsByIndustry.map((row, i) => ({
  name: row.industry,
  value: row.value,
  fill: ["#6366f1", "#4f7ffb", "#57b885", "#eaa234", "#dc534d"][i],
}));

export const aiInsights = [
  {
    type: "warning" as const,
    icon: "alert",
    title: "Tech volume vs. conversion",
    body: "Tech roles have high application volume but a low interview rate (12%)—prioritize screening quality over volume.",
  },
  {
    type: "idea" as const,
    icon: "lightbulb",
    title: "Skills gap signal",
    body: "Candidates lacking Python & SQL show 35% lower success in data-facing roles. Surface upskill nudges at apply-time.",
  },
  {
    type: "trend" as const,
    icon: "trending",
    title: "Marketing outperforms",
    body: "Marketing roles show the highest conversion to interview at 22%—replicate messaging templates from top-performing listings.",
  },
  {
    type: "target" as const,
    icon: "target",
    title: "Design portfolio lift",
    body: "Recommend users improve portfolio depth for Design roles—median time-to-interview drops 9 days when 3+ case studies are linked.",
  },
];

export const universityAnalytics = {
  employmentRate: 72,
  avgTimeToJobMonths: 3.2,
  topIndustries: [
    { name: "Tech", pct: 38 },
    { name: "Finance", pct: 22 },
  ],
  suggestion:
    "Students lack data analytics depth—recommend adding Python & SQL micro-courses to the career curriculum.",
};

export const recruitmentInsights = {
  timeToHireDays: 21,
  qualityScore: 7.8,
  bestSource: { name: "HireMind AI matching", pct: 45 },
};

/** US universities for campus analytics selector */
export const usUniversities = [
  { id: "all", name: "All universities" },
  { id: "mit", name: "MIT" },
  { id: "stanford", name: "Stanford University" },
  { id: "berkeley", name: "UC Berkeley" },
  { id: "cmu", name: "Carnegie Mellon University" },
  { id: "harvard", name: "Harvard University" },
  { id: "umich", name: "University of Michigan" },
  { id: "utexas", name: "University of Texas at Austin" },
  { id: "uw", name: "University of Washington" },
  { id: "gatech", name: "Georgia Institute of Technology" },
] as const;

export const degreeFilterOptions = ["All", "Bachelor", "Master", "PhD"] as const;
export const majorFilterOptions = [
  "All",
  "Computer Science",
  "Business / MBA",
  "Electrical Engineering",
  "Data Science",
  "Economics",
  "Psychology",
] as const;

export type DegreeFilter = (typeof degreeFilterOptions)[number];
export type MajorFilter = (typeof majorFilterOptions)[number];

export const employmentRateByUniversity = [
  { school: "Stanford", rate: 78 },
  { school: "MIT", rate: 76 },
  { school: "Harvard", rate: 73 },
  { school: "CMU", rate: 74 },
  { school: "UC Berkeley", rate: 72 },
  { school: "Georgia Tech", rate: 70 },
  { school: "UW", rate: 69 },
  { school: "UT Austin", rate: 67 },
  { school: "UMich", rate: 66 },
];

export const employmentRateByDegree = [
  { degree: "PhD", rate: 81 },
  { degree: "Master", rate: 74 },
  { degree: "Bachelor", rate: 68 },
];

export const employmentRateByMajor = [
  { major: "Computer Science", rate: 79 },
  { major: "Data Science", rate: 76 },
  { major: "Electrical Engineering", rate: 71 },
  { major: "Business / MBA", rate: 69 },
  { major: "Economics", rate: 65 },
  { major: "Psychology", rate: 62 },
];

export const timeToJobByEducationLevel = [
  { level: "Bachelor", months: 3.8 },
  { level: "Master", months: 3.1 },
  { level: "PhD", months: 2.4 },
];

export const universityAIInsights = [
  {
    title: "Degree impact on hiring success",
    body: "PhD holders see +9pp employment vs. bachelor in our 12‑month cohort; the gap narrows to +4pp for non‑technical roles where portfolio matters more than credentials.",
    accent: "violet" as const,
  },
  {
    title: "Skill gaps by major",
    body: "CS & Data Science grads lacking production ML or SQL underperform peers by 18% in callback rate; Business majors miss modeling—candidates with spreadsheet + SQL certs close 22% more offers.",
    accent: "amber" as const,
  },
  {
    title: "Technical vs non-technical",
    body: "Technical roles show higher salary variance by school tier; non-technical placements are more uniform—networking and case interview prep drive 31% of variance outside eng/product tracks.",
    accent: "emerald" as const,
  },
];

export const companyMatchThresholds = [
  { company: "Google", companyType: "Big Tech", minMatch: 90 },
  { company: "Meta", companyType: "Big Tech", minMatch: 88 },
  { company: "Goldman Sachs", companyType: "Finance", minMatch: 86 },
  { company: "Stripe", companyType: "Growth Tech", minMatch: 85 },
  { company: "Databricks", companyType: "Growth Tech", minMatch: 84 },
  { company: "Series A startup", companyType: "Startup", minMatch: 70 },
  { company: "Seed startup", companyType: "Startup", minMatch: 65 },
];

export const crossEmployerCandidate = {
  name: "Jordan Park",
  role: "Software Engineer",
  baseSkills: "Python, React, AWS",
  rows: [
    { employer: "Google", companyType: "Big Tech", match: 88, response: "Recruiter screen", minBar: 90 },
    { employer: "Meta", companyType: "Big Tech", match: 86, response: "Applied — queue", minBar: 88 },
    { employer: "Stripe", companyType: "Growth Tech", match: 91, response: "Interview scheduled", minBar: 85 },
    { employer: "Nimbus Labs (Series A)", companyType: "Startup", match: 92, response: "Offer extended", minBar: 70 },
  ],
};

/** Aggregate points for match score vs employer response rate (%) */
export const matchScoreVsResponseRate = [
  { match: 58, responseRate: 6 },
  { match: 62, responseRate: 8 },
  { match: 66, responseRate: 11 },
  { match: 70, responseRate: 15 },
  { match: 74, responseRate: 19 },
  { match: 78, responseRate: 24 },
  { match: 82, responseRate: 29 },
  { match: 86, responseRate: 34 },
  { match: 90, responseRate: 38 },
  { match: 94, responseRate: 42 },
];

export const recruitmentAIInsights = [
  {
    title: "Selectiveness by company type",
    body: "Big Tech median minimum match is 88; growth-stage product companies cluster at 83–86; seed–Series A startups accept ~65–72 when culture fit and velocity signals are strong.",
    accent: "blue" as const,
  },
  {
    title: "Minimum match for callbacks",
    body: "Across 4.2k outcomes, first human touch correlates with match ≥78 for finance, ≥82 for Big Tech SWE, and ≥68 for early-stage startups—below that, automation rarely escalates.",
    accent: "violet" as const,
  },
  {
    title: "Improving match score",
    body: "Top lifts: align skills section to JD keywords (+4–7 pts), add measurable impact bullets (+3–5), complete skills assessments (+6), and tailor one role-specific paragraph in the summary (+2–4).",
    accent: "emerald" as const,
  },
];

/** Aggregated platform performance by segment (no individual candidates) */
export type SegmentTrend = "↑" | "↓" | "→";

export interface SegmentPerformanceRow {
  segment: string;
  applications: number;
  matchScore: number;
  interviewRate: number;
  offerRate: number;
  responseTime: number;
  trend: SegmentTrend;
}

export const segmentPerformanceAIInsight =
  "Users with AI-assisted resumes show +15 match score and +60% higher interview rate compared to non-AI users.";

export const segmentPerformanceRows: SegmentPerformanceRow[] = [
  {
    segment: "Tech roles",
    applications: 9200,
    matchScore: 81,
    interviewRate: 21,
    offerRate: 7,
    responseTime: 5.2,
    trend: "↑",
  },
  {
    segment: "Finance roles",
    applications: 5400,
    matchScore: 76,
    interviewRate: 17,
    offerRate: 6,
    responseTime: 6.8,
    trend: "→",
  },
  {
    segment: "Marketing roles",
    applications: 4100,
    matchScore: 74,
    interviewRate: 18,
    offerRate: 6,
    responseTime: 6.2,
    trend: "→",
  },
  {
    segment: "Users with AI-assisted resume",
    applications: 11200,
    matchScore: 84,
    interviewRate: 24,
    offerRate: 8,
    responseTime: 4.2,
    trend: "↑",
  },
  {
    segment: "Users without AI assistance",
    applications: 8100,
    matchScore: 69,
    interviewRate: 15,
    offerRate: 4,
    responseTime: 7.6,
    trend: "↓",
  },
  {
    segment: "Bachelor students",
    applications: 9800,
    matchScore: 73,
    interviewRate: 16,
    offerRate: 5,
    responseTime: 6.9,
    trend: "→",
  },
  {
    segment: "Master students",
    applications: 6200,
    matchScore: 80,
    interviewRate: 22,
    offerRate: 7,
    responseTime: 5.1,
    trend: "↑",
  },
];
