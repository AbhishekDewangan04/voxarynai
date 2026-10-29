import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bot, Pause, Play, Plus, Trash2, Pencil } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GlassButton, GlassCard, GlassPanel } from "@/components/site/Glass";
import { useToast } from "@/components/ui/use-toast";
import AgentForm from "@/components/app/AgentForm";
import EmptyState from "@/components/app/EmptyState";
import LoadDemoDataButton from "@/components/app/LoadDemoDataButton";
import PageHeader from "@/components/app/PageHeader";
import { SkeletonCards } from "@/components/app/Skeleton";
import { PERMISSIONS } from "@/lib/agentOptions";

export default function Agents() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const user = await base44.auth.me();
    const page = await base44.entities.Agent.filter({ owner_id: user.id }, { sort: "-created_date", limit: 50 });
    setAgents(page.items ?? []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (params.get("new") === "1") {
      setEditing({});
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await base44.entities.Agent.update(editing.id, values);
        toast({ title: "Agent updated", description: `${values.name} has the new personality.` });
      } else {
        const user = await base44.auth.me();
        await base44.entities.Agent.create({ ...values, owner_id: user.id, status: "active" });
        toast({ title: "Agent created", description: `${values.name} is ready to take calls.` });
      }
      setEditing(null);
      await load();
    } catch (error) {
      toast({ title: "Couldn't save agent", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (agent) => {
    setBusyId(agent.id);
    try {
      const status = agent.status === "active" ? "paused" : "active";
      await base44.entities.Agent.update(agent.id, { status });
      toast({ title: status === "active" ? "Agent resumed" : "Agent paused", description: agent.name });
      await load();
    } catch (error) {
      toast({ title: "Couldn't update agent", description: error.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (agent) => {
    setBusyId(agent.id);
    try {
      await base44.entities.Agent.delete(agent.id);
      toast({ title: "Agent deleted", description: `${agent.name} no longer answers calls.` });
      setConfirmId(null);
      await load();
    } catch (error) {
      toast({ title: "Couldn't delete agent", description: error.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Workspace"
        title="Agents"
        description="Each agent has its own personality, greeting and permissions. Pausing stops it answering new calls."
      >
        <GlassButton size="sm" tone="primary" onClick={() => setEditing({})}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New agent
          </span>
        </GlassButton>
      </PageHeader>

      {loading ? (
        <SkeletonCards count={3} />
      ) : agents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No agents yet"
          description="Create your first agent to answer calls in your voice, or load a demo workspace to explore."
        >
          <button
            type="button"
            onClick={() => setEditing({})}
            className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-white/25"
          >
            Create your first agent
          </button>
          <LoadDemoDataButton onLoaded={load} />
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => {
            const enabled = PERMISSIONS.filter((permission) => agent.permissions?.[permission.key]).length;
            const active = agent.status === "active";
            return (
              <GlassCard key={agent.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-white">{agent.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-white/45">
                      {agent.purpose || "No purpose set yet"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      active
                        ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-200"
                        : "border-white/15 bg-white/[0.06] text-white/50"
                    }`}
                  >
                    {active ? "active" : "paused"}
                  </span>
                </div>

                <dl className="mt-3 space-y-1.5 text-[11.5px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-white/35">Number</dt>
                    <dd className="truncate font-mono text-white/70">{agent.phone_number || "not assigned"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-white/35">Voice</dt>
                    <dd className="text-white/70">
                      {agent.voice} · {agent.tone}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-white/35">Language</dt>
                    <dd className="text-white/70">{agent.language}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-white/35">Permissions</dt>
                    <dd className="text-white/70">
                      {enabled} of {PERMISSIONS.length}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 line-clamp-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-[11.5px] leading-relaxed text-white/50">
                  “{agent.greeting}”
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
                  <GlassButton size="sm" tone="quiet" disabled={busyId === agent.id} onClick={() => toggleStatus(agent)}>
                    <span className="inline-flex items-center gap-1.5">
                      {active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {active ? "Pause" : "Resume"}
                    </span>
                  </GlassButton>
                  <GlassButton size="sm" tone="quiet" onClick={() => setEditing(agent)}>
                    <span className="inline-flex items-center gap-1.5">
                      <Pencil className="h-3 w-3" /> Edit
                    </span>
                  </GlassButton>
                  {confirmId === agent.id ? (
                    <button
                      type="button"
                      onClick={() => remove(agent)}
                      disabled={busyId === agent.id}
                      className="ml-auto rounded-full border border-rose-300/30 bg-rose-400/15 px-3 py-1.5 text-[11.5px] font-medium text-rose-100 transition-colors hover:bg-rose-400/25"
                    >
                      Confirm delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(agent.id)}
                      aria-label={`Delete ${agent.name}`}
                      className="ml-auto rounded-full p-2 text-white/35 transition-colors hover:bg-white/10 hover:text-rose-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <button
            type="button"
            aria-label="Close form"
            onClick={() => setEditing(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          <div data-lenis-prevent className="relative mx-auto my-6 w-full max-w-2xl px-3">
            <GlassPanel className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    {editing.id ? "Edit agent" : "New agent"}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-white">
                    {editing.id ? editing.name : "Design your agent"}
                  </p>
                </div>
                <GlassButton size="sm" tone="quiet" onClick={() => setEditing(null)}>
                  Close
                </GlassButton>
              </div>
              <AgentForm
                agent={editing.id ? editing : null}
                saving={saving}
                onCancel={() => setEditing(null)}
                onSave={handleSave}
              />
            </GlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}