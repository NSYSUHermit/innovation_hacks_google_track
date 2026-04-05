import { Bell, Globe, Lock, Palette } from "lucide-react";

export function SettingsPanel() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <section className="glass-panel col-span-12 p-5 lg:col-span-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-brand-600" />
          <h2 className="text-sm font-semibold text-navy dark:text-white">Workspace</h2>
        </div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Default timezone</label>
        <select className="mt-1 w-full rounded-[12px] border border-border bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          <option>UTC−08:00 Pacific</option>
          <option>UTC+08:00 Singapore</option>
        </select>
        <label className="mt-4 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Data region</label>
        <select className="mt-1 w-full rounded-[12px] border border-border bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          <option>US — Oregon</option>
          <option>EU — Frankfurt</option>
        </select>
      </section>

      <section className="glass-panel col-span-12 p-5 lg:col-span-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-600" />
          <h2 className="text-sm font-semibold text-navy dark:text-white">Notifications</h2>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between border-b border-border py-2 dark:border-zinc-800">
            <span>Interview reminders</span>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-brand-500" />
          </li>
          <li className="flex items-center justify-between border-b border-border py-2 dark:border-zinc-800">
            <span>Weekly digest</span>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-brand-500" />
          </li>
          <li className="flex items-center justify-between py-2">
            <span>Slack alerts</span>
            <input type="checkbox" className="h-4 w-4 rounded border-border text-brand-500" />
          </li>
        </ul>
      </section>

      <section className="glass-panel col-span-12 p-5 lg:col-span-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-brand-600" />
          <h2 className="text-sm font-semibold text-navy dark:text-white">Security</h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          SSO enforced for admin roles. Last policy sync: <span className="font-mono text-navy dark:text-zinc-200">2026-04-02</span>
        </p>
        <button
          type="button"
          className="mt-3 rounded-[12px] border border-border bg-brand-50 px-3 py-2 text-sm font-medium text-navy dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          View audit log
        </button>
      </section>

      <section className="glass-panel col-span-12 p-5 lg:col-span-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-brand-600" />
          <h2 className="text-sm font-semibold text-navy dark:text-white">Appearance</h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Theme follows the toggle in the header (light / dark).
        </p>
      </section>
    </div>
  );
}
