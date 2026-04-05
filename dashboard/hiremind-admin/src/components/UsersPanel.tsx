import { Mail, Shield } from "lucide-react";

const mockUsers = [
  { name: "Alex Rivera", email: "alex@hiremind.io", role: "Admin", status: "Active" },
  { name: "Jordan Lee", email: "jordan@acme.com", role: "Recruiter", status: "Active" },
  { name: "Sam Patel", email: "sam@startup.co", role: "Hiring manager", status: "Invited" },
  { name: "Riley Chen", email: "riley@corp.io", role: "Viewer", status: "Active" },
  { name: "Morgan Blake", email: "morgan@labs.dev", role: "Recruiter", status: "Suspended" },
];

export function UsersPanel() {
  return (
    <section className="glass-panel overflow-hidden">
      <div className="border-b border-border p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-navy dark:text-white">Team & access</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage platform users and roles</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-zinc-50/80 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((u) => (
              <tr
                key={u.email}
                className="border-b border-border transition hover:bg-brand-50/40 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
              >
                <td className="px-4 py-3 font-medium text-navy dark:text-zinc-100">{u.name}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    {u.email}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-500/15 dark:text-brand-200">
                    <Shield className="h-3 w-3" />
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.status === "Active"
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : u.status === "Invited"
                          ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
