import { AlertTriangle, Brain, Lightbulb, Target, TrendingUp } from "lucide-react";
import { aiInsights } from "../data/mockData";

const icons = {
  alert: AlertTriangle,
  lightbulb: Lightbulb,
  trending: TrendingUp,
  target: Target,
};

const styles = {
  warning: {
    card: "border-amber-200/80 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30",
    icon: "text-semantic-amber",
  },
  idea: {
    card: "border-blue-200/80 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/30",
    icon: "text-semantic-blue",
  },
  trend: {
    card: "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/30",
    icon: "text-semantic-green",
  },
  target: {
    card: "border-violet-200/80 bg-violet-50/70 dark:border-violet-900/50 dark:bg-violet-950/30",
    icon: "text-brand-600 dark:text-brand-400",
  },
};

export function AIInsightsPanel() {
  return (
    <section className="glass-panel p-4 lg:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
          <Brain className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-navy dark:text-white">AI insights</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Actionable signals from your platform data — refreshed hourly
          </p>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        {aiInsights.map((insight) => {
          const Icon = icons[insight.icon as keyof typeof icons];
          const s = styles[insight.type];
          return (
            <div
              key={insight.title}
              className={`col-span-12 rounded-card border p-4 transition hover:shadow-md md:col-span-6 xl:col-span-3 ${s.card}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.icon}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy dark:text-zinc-100">{insight.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{insight.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
