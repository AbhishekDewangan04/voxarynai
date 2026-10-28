import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, PhoneCall } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GlassCard, GlassPanel } from "@/components/site/Glass";
import CallsChart from "@/components/dashboard/CallsChart";
import EmptyState from "@/components/app/EmptyState";
import LoadDemoDataButton from "@/components/app/LoadDemoDataButton";
import PageHeader from "@/components/app/PageHeader";
import StatCard from "@/components/app/StatCard";
import { SkeletonRows } from "@/components/app/Skeleton";
import { SENTIMENT_STYLES, formatDuration, formatWhen } from "@/lib/format";

export default function Overview() {
  const navigate = useNavigate();
  const [data, setData] = useState({ agents: [], calls: [], tasks: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const user = await base44.auth.me();
    const owner = { owner_id: user.id };
    const [agentsPage, callsPage, tasksPage] = await Promise.all([
      base44.entities.Agent.filter(owner, { limit: 50 }),
      base44.entities.Call.filter(owner, { sort: "-started_at", limit: 100 }),
      base44.entities.Task.filter(owner, { limit: 200 }),
    ]);
    setData({
      agents: agentsPage.items ?? [],
      calls: callsPage.items ?? [],
      tasks: tasksPage.items ?? [],
    });
  }, []);

  useEffect(() => {
    let active = true;
    load()
      .catch(() => null)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const weekCalls = data.calls.filter((call) => new Date(call.started_at || call.created_date).getTime() >= weekAgo);
    const durations = weekCalls.map((call) => Number(call.duration_seconds) || 0).filter(Boolean);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
      : 0;
    const done = data.tasks.filter((task) => task.status === "done").length;
    const hoursSaved = (weekCalls.reduce((sum, call) => sum + (Number(call.duration_seconds) || 0), 0) / 3600) * 1.5 + done * 0.05;

    return {
      weekCalls: weekCalls.length,
      avgDuration,
      done,
      hoursSaved: hoursSaved.toFixed(1),
      weekCallsList: weekCalls,
    };
  }, [data]);

  const chart = useMemo(() => {
    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);
      const key = date.toDateString();
      const dayCalls = data.calls.filter(
        (call) => call.started_at && new Date(call.started_at).toDateString() === key
      );
      const ids = new Set(dayCalls.map((call) => call.id));
      days.push({
        day: date.toLocaleDateString(undefined, { weekday: "short" }),
        calls: dayCalls.length,
        booked: data.tasks.filter((task) => task.type === "booking" && ids.has(task.call_id)).length,
      });
    }
    return days;
  }, [data]);

  const agentNames = useMemo(
    () => Object.fromEntries(data.agents.map((agent) => [agent.id, agent.name])),
    [data.agents]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="Workspace" title="Overview" description="Live signal from every agent in this workspace." />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <GlassCard key={key} className="p-4">
              <div className="h-3 w-24 animate-pulse rounded-full bg-white/[0.07]" />
              <div className="mt-3 h-6 w-16 animate-pulse rounded-full bg-white/[0.07]" />
            </GlassCard>
          ))}
        </div>
        <GlassPanel className="p-5">
          <SkeletonRows rows={3} />
        </GlassPanel>
      </div>
    );
  }

  if (data.agents.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="Workspace" title="Overview" description="Live signal from every agent in this workspace." />
        <EmptyState
          icon={Bot}
          title="No agents yet"
          description="Create your first voice agent to start answering calls, or load a demo workspace to see how everything works."
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard/agents?new=1")}
            className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-white/25"
          >
            Create your first agent
          </button>
          <LoadDemoDataButton onLoaded={load} />
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Workspace"
        title="Overview"
        description={`${data.agents.length} agent${data.agents.length === 1 ? "" : "s"} handling calls across this workspace.`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Calls this week" value={stats.weekCalls} hint="rolling 7 days" />
        <StatCard label="Avg response" value={formatDuration(stats.avgDuration)} hint="per answered call" />
        <StatCard label="Tasks done" value={stats.done} hint={`${data.tasks.length} logged in total`} />
        <StatCard label="Hours saved" value={`${stats.hoursSaved}h`} hint="vs handling calls yourself" />
      </div>

      <GlassPanel className="p-5" refraction={20}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Call volume</p>
            <p className="mt-1 text-[12.5px] text-white/60">Last 7 days · all agents</p>
          </div>
          <div className="flex items-center gap-4 text-[10.5px] text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-4 rounded-full bg-indigo-300" /> Calls
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-4 rounded-full bg-cyan-300" /> Booked
            </span>
          </div>
        </div>
        <div className="mt-3">
          <CallsChart data={chart} height={200} />
        </div>
      </GlassPanel>

      <GlassPanel className="p-5" refraction={18}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Recent calls</p>
          <button
            type="button"
            onClick={() => navigate("/dashboard/calls")}
            className="text-[11.5px] text-white/45 transition-colors hover:text-white"
          >
            View all →
          </button>
        </div>

        {data.calls.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={PhoneCall}
              title="No calls yet"
              description="Simulate an incoming call from the Calls page to watch an agent handle it end to end."
            >
              <button
                type="button"
                onClick={() => navigate("/dashboard/calls")}
                className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-white/25"
              >
                Go to calls
              </button>
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-white/8">
            {data.calls.slice(0, 6).map((call) => (
              <li key={call.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/calls?call=${call.id}`)}
                  className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.07] text-[10.5px] font-semibold text-white/70">
                    {(call.caller_name || "?").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-white">{call.caller_name || "Unknown caller"}</p>
                    <p className="truncate text-[11px] text-white/40">
                      {agentNames[call.agent_id] || "Agent"} · {call.intent || "General enquiry"}
                    </p>
                  </div>
                  <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] sm:inline ${SENTIMENT_STYLES[call.sentiment] || SENTIMENT_STYLES.Neutral}`}>
                    {call.sentiment || "Neutral"}
                  </span>
                  <span className="w-14 shrink-0 text-right text-[11px] text-white/35">{formatDuration(call.duration_seconds)}</span>
                  <span className="w-14 shrink-0 text-right text-[11px] text-white/30">{formatWhen(call.started_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>
    </div>
  );
}