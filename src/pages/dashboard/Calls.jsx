import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PhoneCall, PhoneIncoming } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GlassButton, GlassPanel } from "@/components/site/Glass";
import { useToast } from "@/components/ui/use-toast";
import CallDrawer from "@/components/app/CallDrawer";
import EmptyState from "@/components/app/EmptyState";
import LoadDemoDataButton from "@/components/app/LoadDemoDataButton";
import PageHeader from "@/components/app/PageHeader";
import { SkeletonRows } from "@/components/app/Skeleton";
import { SelectField } from "@/components/app/Field";
import { STATUS_STYLES, SENTIMENT_STYLES, formatDuration, formatWhen } from "@/lib/format";
import { simulateIncomingCall } from "@/lib/simulateCall";

export default function Calls() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [calls, setCalls] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [openId, setOpenId] = useState(params.get("call") || null);

  const load = useCallback(async () => {
    const user = await base44.auth.me();
    const owner = { owner_id: user.id };
    const [agentsPage, callsPage] = await Promise.all([
      base44.entities.Agent.filter(owner, { limit: 50 }),
      base44.entities.Call.filter(owner, { sort: "-started_at", limit: 100 }),
    ]);
    setAgents(agentsPage.items ?? []);
    setCalls(callsPage.items ?? []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const hasLive = calls.some((call) => call.status === "live");

  useEffect(() => {
    if (!hasLive && !simulating) return undefined;
    const timer = window.setInterval(() => {
      load().catch(() => null);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [hasLive, simulating, load]);

  const agentNames = useMemo(
    () => Object.fromEntries(agents.map((agent) => [agent.id, agent.name])),
    [agents]
  );

  const filtered = useMemo(
    () =>
      calls.filter(
        (call) =>
          (statusFilter === "all" || call.status === statusFilter) &&
          (agentFilter === "all" || call.agent_id === agentFilter)
      ),
    [calls, statusFilter, agentFilter]
  );

  const openCall = calls.find((call) => call.id === openId) || null;

  const handleSimulate = async () => {
    const agent =
      agents.find((item) => item.status === "active" && (agentFilter === "all" || item.id === agentFilter)) ||
      agents.find((item) => item.status === "active");

    if (!agent) {
      toast({
        title: "No active agent",
        description: "Create or resume an agent before simulating a call.",
        variant: "destructive",
      });
      return;
    }

    setSimulating(true);
    toast({ title: `Incoming call for ${agent.name}`, description: "Priya Nair is on the line — transcript streaming." });

    try {
      const result = await simulateIncomingCall({ agent });
      toast({
        title: "Call complete",
        description: result.usedMemory
          ? "The greeting used a stored memory. Summary, tasks and memories updated."
          : "Summary, tasks and memories updated.",
      });
      await load();
      setOpenId(result.callId);
    } catch (error) {
      toast({ title: "Simulation failed", description: error.message, variant: "destructive" });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Workspace"
        title="Calls"
        description="Every call an agent handled, with its transcript, summary and follow-up tasks."
      >
        <GlassButton size="sm" tone="primary" onClick={handleSimulate} disabled={simulating || agents.length === 0}>
          <span className="inline-flex items-center gap-1.5">
            {simulating ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <PhoneIncoming className="h-3.5 w-3.5" />
            )}
            {simulating ? "Call in progress…" : "Simulate incoming call"}
          </span>
        </GlassButton>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-lg">
        <SelectField label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="missed">Missed</option>
          <option value="blocked">Blocked</option>
        </SelectField>
        <SelectField label="Agent" value={agentFilter} onChange={(event) => setAgentFilter(event.target.value)}>
          <option value="all">All agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </SelectField>
      </div>

      <GlassPanel className="p-4 sm:p-5">
        {loading ? (
          <SkeletonRows rows={5} />
        ) : calls.length === 0 ? (
          <EmptyState
            icon={PhoneCall}
            title="No calls yet"
            description="Simulate an incoming call to watch an agent greet a caller, capture the transcript and file the follow-ups."
          >
            <button
              type="button"
              onClick={handleSimulate}
              disabled={simulating || agents.length === 0}
              className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-white/25 disabled:opacity-50"
            >
              Simulate incoming call
            </button>
            {agents.length === 0 && <LoadDemoDataButton onLoaded={load} />}
          </EmptyState>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-[12.5px] text-white/40">No calls match these filters.</p>
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-white/35">
                  <th className="px-2 pb-2 font-medium">Caller</th>
                  <th className="px-2 pb-2 font-medium">Agent</th>
                  <th className="px-2 pb-2 font-medium">Intent</th>
                  <th className="px-2 pb-2 font-medium">Status</th>
                  <th className="px-2 pb-2 font-medium">Sentiment</th>
                  <th className="px-2 pb-2 text-right font-medium">Length</th>
                  <th className="px-2 pb-2 text-right font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => setOpenId(call.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setOpenId(call.id);
                    }}
                    tabIndex={0}
                    className="cursor-pointer border-t border-white/8 text-[12px] transition-colors hover:bg-white/[0.05]"
                  >
                    <td className="px-2 py-3">
                      <p className="font-medium text-white">{call.caller_name || "Unknown caller"}</p>
                      <p className="font-mono text-[10.5px] text-white/35">{call.caller_number || "—"}</p>
                    </td>
                    <td className="px-2 py-3 text-white/60">{agentNames[call.agent_id] || "—"}</td>
                    <td className="max-w-[160px] truncate px-2 py-3 text-white/55">{call.intent || "—"}</td>
                    <td className="px-2 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${STATUS_STYLES[call.status] || STATUS_STYLES.completed}`}>
                        {call.status === "live" ? "live" : call.status}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${SENTIMENT_STYLES[call.sentiment] || SENTIMENT_STYLES.Neutral}`}>
                        {call.sentiment || "Neutral"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right text-white/50">{formatDuration(call.duration_seconds)}</td>
                    <td className="px-2 py-3 text-right text-white/35">{formatWhen(call.started_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>

      {openCall && (
        <CallDrawer
          call={openCall}
          onClose={() => {
            setOpenId(null);
            if (params.get("call")) setParams({}, { replace: true });
          }}
        />
      )}
    </div>
  );
}