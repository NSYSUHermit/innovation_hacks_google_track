import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import type { KpiItem } from "../data/dashboardFilters";

function formatVal(n: number, suffix?: string) {
  if (suffix === "%") return `${n}${suffix}`;
  return n.toLocaleString("en-US");
}

function formatDeltaBadge(k: KpiItem): string {
  if (k.deltaFlat) {
    return k.deltaUnit === "pct" ? "0%" : "0pp";
  }
  const sign = k.up ? "+" : "−";
  return k.deltaUnit === "pct" ? `${sign}${k.change}%` : `${sign}${k.change}pp`;
}

interface KpiCardsProps {
  kpi: KpiItem[];
}

export function KpiCards({ kpi }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 lg:gap-4">
      {kpi.map((k) => {
        const sparkData = k.spark.map((v, i) => ({ i, v }));
        const flat = k.deltaFlat;
        const badgeCls = flat
          ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          : k.up
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
            : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400";

        return (
          <div key={k.id} className="glass-panel p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {k.label}
            </p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <p className="font-mono text-2xl font-semibold tracking-tight text-navy dark:text-white">
                {formatVal(k.value, k.suffix)}
              </p>
              <div className="flex flex-col items-end gap-0.5">
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${badgeCls}`}
                >
                  {flat ? (
                    <Minus className="h-3 w-3" />
                  ) : k.up ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatDeltaBadge(k)}
                </span>
                <span className="max-w-[9rem] text-right text-[10px] font-medium leading-tight text-zinc-500 dark:text-zinc-400">
                  {k.comparisonVs}
                </span>
              </div>
            </div>
            <div className="mt-3 h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <YAxis domain={["dataMin", "dataMax"]} hide />
                  <defs>
                    <linearGradient id={`g-${k.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    fill={`url(#g-${k.id})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
