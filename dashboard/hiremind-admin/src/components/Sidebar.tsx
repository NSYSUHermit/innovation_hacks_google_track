import {
  BarChart3,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

export type NavId = "dashboard" | "ai-insights" | "applications" | "users" | "settings";

const navItems: {
  id: NavId;
  label: string;
  icon: typeof BarChart3;
  notify?: boolean;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "ai-insights", label: "AI Insights", icon: Sparkles, notify: true },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  active: NavId;
  onNavigate: (id: NavId) => void;
  onLogout?: () => void;
}

export function Sidebar({ collapsed, onToggle, active, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-white transition-[width] duration-200 dark:border-zinc-800 dark:bg-zinc-950 ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3 dark:border-zinc-800">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
            <Brain className="h-5 w-5" strokeWidth={2} />
          </div>
          {!collapsed && (
            <span className="truncate font-semibold tracking-tight text-navy dark:text-white">HireMind</span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-zinc-800 dark:hover:text-brand-400"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-y-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-brand-500 text-white shadow-sm dark:bg-brand-500"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : ""}`} strokeWidth={2} />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.notify && (
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        isActive ? "bg-white/90" : "bg-semantic-blue"
                      }`}
                      aria-hidden
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border p-2 dark:border-zinc-800">
        <button
          type="button"
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-[#dc534d] transition hover:bg-red-50 dark:hover:bg-red-950/30 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={2} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
