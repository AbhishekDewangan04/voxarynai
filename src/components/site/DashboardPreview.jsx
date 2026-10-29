import React, { Suspense, lazy, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { agents, calls, callsPerDay, workspaceStats } from "@/lib/demoData";
import { GlassButton, GlassPanel } from "./Glass";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";
import AgentsList from "@/components/dashboard/AgentsList";
import CallLogTable from "@/components/dashboard/CallLogTable";
import SummaryCard from "@/components/dashboard/SummaryCard";
import TranscriptPanel from "@/components/dashboard/TranscriptPanel";

const CallsChart = lazy(() => import("@/components/dashboard/CallsChart"));

export default function DashboardPreview() {
  const [agentId, setAgentId] = useState(agents[0].id);
  const [callId, setCallId] = useState(calls[0].id);

  const agentCalls = useMemo(() => calls.filter((call) => call.agentId === agentId), [agentId]);
  const activeCall = agentCalls.find((call) => call.id === callId) ?? agentCalls[0] ?? calls[0];

  return (
    <SectionShell
      id="dashboard"
      eyebrow="The dashboard"
      title="Every call, transcript and task in one place."
      description="Watch calls as they happen, read what was said, and see exactly what your agent did — with a summary written the moment the call ends."
    >
      <div className="relative mt-14">
        <div
          aria-hidden="true"
          className="absolute -inset-x-8 -inset-y-12 -z-10 bg-[radial-gradient(45%_50%_at_15%_10%,rgba(47,91,255,0.42),transparent_70%),radial-gradient(40%_45%_at_85%_80%,rgba(232,121,249,0.26),transparent_72%)] blur-[60px]"
        />
        <Reveal y={36}>
          <GlassPanel className="p-3 sm:p-4">
            {/* window chrome */}
            <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-1">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 font-mono text-[10.5px] text-white/35">app.voxaryn.ai/dashboard</span>
              </div>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                Live
              </span>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-[#070a17]/70 p-3 sm:p-4">
              <div className="grid gap-4 lg:grid-cols-[210px_1fr]">
                {/* agents column */}
                <div>
                  <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Agents</p>
                  <AgentsList agents={agents} activeId={agentId} onSelect={setAgentId} compact />
                </div>

                {/* main */}
                <div className="min-w-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {workspaceStats.map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                        <p className="text-[9.5px] uppercase tracking-[0.12em] text-white/35">{stat.label}</p>
                        <p className="mt-0.5 font-display text-[15px] font-bold text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 pb-1 pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/35">Calls per day</p>
                      <div className="flex items-center gap-3 text-[9.5px] text-white/40">
                        <span className="flex items-center gap-1"><span className="h-1 w-3 rounded-full bg-indigo-300" />Calls</span>
                        <span className="flex items-center gap-1"><span className="h-1 w-3 rounded-full bg-cyan-300" />Booked</span>
                      </div>
                    </div>
                    <Suspense fallback={<div style={{ height: 132 }} className="w-full animate-pulse rounded-xl bg-white/[0.02]" />}>
                      <CallsChart data={callsPerDay} height={132} compact />
                    </Suspense>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                    <CallLogTable calls={agentCalls} activeId={activeCall?.id} onSelect={setCallId} />
                  </div>
                </div>
              </div>

              {/* transcript + summary */}
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <TranscriptPanel call={activeCall} maxHeight="11.5rem" />
                </div>
                <SummaryCard call={activeCall} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4">
              <p className="text-[11.5px] text-white/40">Sample workspace · data shown is illustrative</p>
              <GlassButton size="sm">
                <Link to="/dashboard" className="inline-flex items-center gap-1.5">
                  Open the demo dashboard
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </GlassButton>
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </SectionShell>
  );
}