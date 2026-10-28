import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  ArrowUpRight,
  Bot,
  Brain,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Phone,
  Plug,
  Settings,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import Background from "@/components/site/Background";
import Brand from "@/components/site/Brand";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/agents", label: "Agents", icon: Bot },
  { to: "/dashboard/calls", label: "Calls", icon: Phone },
  { to: "/dashboard/memory", label: "Memory", icon: Brain },
  { to: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { to: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function navClass({ isActive }) {
  return `flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
    isActive
      ? "border border-white/15 bg-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
      : "border border-transparent text-white/55 hover:bg-white/[0.06] hover:text-white"
  }`;
}

export default function DashboardShell() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const initials = (user?.full_name || user?.email || "V")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Background />
      <div className="mx-auto flex w-full max-w-[1500px] gap-4 px-3 py-3 sm:px-5 sm:py-4">
        <aside className="hidden w-[228px] shrink-0 lg:block">
          <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-[1.75rem] border border-white/12 bg-white/[0.045] p-3 backdrop-blur-2xl">
            <Link to="/" className="block px-2 py-1.5">
              <Brand />
            </Link>

            <nav aria-label="Dashboard" className="mt-4 flex-1 space-y-1">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={navClass}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="flex items-center gap-2.5 px-1 py-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500/60 to-cyan-400/40 text-[11px] font-semibold text-white ring-1 ring-white/25">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-white">{user?.full_name || "Your workspace"}</p>
                  <p className="truncate text-[10.5px] text-white/35">{user?.email}</p>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-1">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[11.5px] text-white/45 transition-colors hover:text-white"
                >
                  Back to site
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => base44.auth.logout()}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[11.5px] text-white/45 transition-colors hover:text-white"
                >
                  <LogOut className="h-3 w-3" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2 overflow-x-auto rounded-full border border-white/12 bg-white/[0.05] p-1.5 backdrop-blur-xl lg:hidden">
            <Link to="/" className="shrink-0 px-2">
              <Brand />
            </Link>
            <span className="h-5 w-px shrink-0 bg-white/15" />
            {NAV.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    isActive ? "bg-white/15 text-white" : "text-white/50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => base44.auth.logout()}
              aria-label="Sign out"
              className="ml-auto shrink-0 rounded-full p-1.5 text-white/45 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>

          <main className="pb-16">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}