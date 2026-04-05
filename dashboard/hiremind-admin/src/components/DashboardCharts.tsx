import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ApplicationsByIndustryRow,
  DashboardSnapshot,
  IndustrySharePieRow,
} from "../data/dashboardFilters";

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid #e3e8ee",
  borderRadius: "8px",
  fontSize: "12px",
};

type GrowthSlice = Pick<DashboardSnapshot, "userGrowth" | "growthSubtitle">;

export function UserGrowthChart({ userGrowth, growthSubtitle }: GrowthSlice) {
  return (
    <div className="glass-panel p-4 lg:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-navy dark:text-white">User growth</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{growthSubtitle}</p>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={userGrowth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
              stroke="#94a3b8"
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [value.toLocaleString("en-US"), "Users"]}
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

type FunnelSlice = Pick<DashboardSnapshot, "funnel" | "funnelSub">;

export function FunnelVisualization({ funnel, funnelSub }: FunnelSlice) {
  const max = funnel[0].value;
  return (
    <div className="glass-panel p-4 lg:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-navy dark:text-white">Conversion funnel</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{funnelSub}</p>
      </div>
      <div className="space-y-3">
        {funnel.map((step) => {
          const pct = Math.round((step.value / max) * 100);
          return (
            <div key={step.name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-navy dark:text-zinc-200">{step.name}</span>
                <span className="font-mono font-semibold tabular-nums text-navy dark:text-white">
                  {step.value.toLocaleString("en-US")}
                </span>
              </div>
              <div className="h-9 overflow-hidden rounded-lg bg-brand-50/80 dark:bg-zinc-800/80">
                <div
                  className="flex h-full items-center justify-end rounded-lg px-2 transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    minWidth: "2.5rem",
                    backgroundColor: step.fill,
                  }}
                >
                  <span className="font-mono text-[10px] font-semibold text-white/95">{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const BAR_FILLS = ["#6366f1", "#4f7ffb", "#57b885", "#eaa234", "#dc534d"];

export function IndustryBarChart({
  applicationsByIndustry,
}: {
  applicationsByIndustry: ApplicationsByIndustryRow[];
}) {
  return (
    <div className="glass-panel p-4 lg:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-navy dark:text-white">Applications by industry</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Volume across tracked verticals</p>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={applicationsByIndustry} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" vertical={false} />
            <XAxis dataKey="industry" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
              stroke="#94a3b8"
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [value.toLocaleString("en-US"), "Applications"]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {applicationsByIndustry.map((_, i) => (
                <Cell key={i} fill={BAR_FILLS[i] ?? BAR_FILLS[0]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function IndustryPieChart({ industrySharePie }: { industrySharePie: IndustrySharePieRow[] }) {
  const total = industrySharePie.reduce((a, b) => a + b.value, 0);
  return (
    <div className="glass-panel p-4 lg:p-5">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-navy dark:text-white">Industry mix</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Share of total applications</p>
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={industrySharePie}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {industrySharePie.map((entry, index) => (
                <Cell key={`c-${index}`} fill={entry.fill} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, _name: string, item: { payload?: { name?: string } }) => {
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
                return [
                  `${value.toLocaleString("en-US")} (${pct}%)`,
                  item.payload?.name ?? "",
                ];
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-zinc-600 dark:text-zinc-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
