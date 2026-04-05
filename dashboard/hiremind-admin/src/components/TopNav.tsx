import { Bell, Moon, Search, Sun } from "lucide-react";

interface TopNavProps {
  darkMode: boolean;
  onToggleDark: () => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export function TopNav({ darkMode, onToggleDark, search, onSearchChange }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-page/80 backdrop-blur-md dark:border-zinc-800 dark:bg-[#0b0f14]/80">
      <div className="flex h-14 flex-wrap items-center gap-3 px-4 py-2 lg:flex-nowrap lg:gap-4 lg:px-6">
        <div className="relative min-w-0 flex-1 basis-full lg:max-w-2xl lg:basis-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidates, jobs, or insights…"
            className="w-full rounded-[12px] border border-border bg-white py-2 pl-9 pr-4 text-sm text-navy shadow-sm outline-none ring-brand-500/20 placeholder:text-zinc-400 focus:border-brand-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onToggleDark}
            className="rounded-[12px] border border-border bg-white p-2 text-zinc-600 transition hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            className="relative rounded-[12px] border border-border bg-white p-2 text-zinc-600 transition hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-semantic-red" />
          </button>

          <div className="hidden items-center gap-3 border-l border-border pl-3 sm:flex dark:border-zinc-700">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-navy dark:text-white">Alex Rivera</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Platform admin
              </p>
            </div>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-brand-100 text-xs font-bold text-brand-800 dark:border-zinc-600 dark:bg-brand-900/40 dark:text-brand-200"
              aria-hidden
            >
              AR
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
