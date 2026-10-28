import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ListChecks } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GlassPanel } from "@/components/site/Glass";
import EmptyState from "@/components/app/EmptyState";
import PageHeader from "@/components/app/PageHeader";
import { SkeletonRows } from "@/components/app/Skeleton";
import { TASK_STATUS_STYLES, TASK_TYPE_LABELS, formatWhen } from "@/lib/format";

const TABS = [
  { id: "all", label: "All" },
  { id: "done", label: "Done" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [calls, setCalls] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const load = useCallback(async () => {
    const user = await base44.auth.me();
    const owner = { owner_id: user.id };
    const [tasksPage, callsPage, agentsPage] = await Promise.all([
      base44.entities.Task.filter(owner, { sort: "-created_date", limit: 200 }),
      base44.entities.Call.filter(owner, { limit: 200 }),
      base44.entities.Agent.filter(owner, { limit: 50 }),
    ]);
    setTasks(tasksPage.items ?? []);
    setCalls(callsPage.items ?? []);
    setAgents(agentsPage.items ?? []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const callsById = useMemo(() => Object.fromEntries(calls.map((call) => [call.id, call])), [calls]);
  const agentsById = useMemo(() => Object.fromEntries(agents.map((agent) => [agent.id, agent])), [agents]);

  const filtered = useMemo(
    () => (tab === "all" ? tasks : tasks.filter((task) => task.status === tab)),
    [tasks, tab]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Workspace"
        title="Tasks"
        description="Every action an agent took — bookings, confirmations and flags — linked to the call that caused it."
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              tab === item.id
                ? "border-white/30 bg-white/15 text-white"
                : "border-white/12 bg-white/[0.04] text-white/50 hover:text-white"
            }`}
          >
            {item.label}
            <span className="ml-1.5 text-[10.5px] text-white/35">
              {item.id === "all" ? tasks.length : tasks.filter((task) => task.status === item.id).length}
            </span>
          </button>
        ))}
      </div>

      <GlassPanel className="p-4 sm:p-5" refraction={18}>
        {loading ? (
          <SkeletonRows rows={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No tasks here yet"
            description="Tasks are created automatically when an agent books, confirms or flags something during a call."
          />
        ) : (
          <ul className="divide-y divide-white/8">
            {filtered.map((task) => {
              const call = callsById[task.call_id];
              return (
                <li key={task.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
                    {TASK_TYPE_LABELS[task.type] || task.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] leading-relaxed text-white/75">{task.description}</p>
                    <p className="mt-0.5 text-[11px] text-white/35">
                      {agentsById[task.agent_id]?.name || "Agent"}
                      {task.created_date ? ` · ${formatWhen(task.created_date)}` : ""}
                    </p>
                  </div>
                  {call ? (
                    <Link
                      to={`/dashboard/calls?call=${call.id}`}
                      className="shrink-0 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/12 hover:text-white"
                    >
                      {call.caller_name || "View call"}
                    </Link>
                  ) : (
                    <span className="shrink-0 text-[11px] text-white/25">no linked call</span>
                  )}
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${
                      TASK_STATUS_STYLES[task.status] || TASK_STATUS_STYLES.pending
                    }`}
                  >
                    {task.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </GlassPanel>
    </div>
  );
}