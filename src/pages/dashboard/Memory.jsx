import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Brain, Pencil, Search, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GlassButton, GlassCard } from "@/components/site/Glass";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/app/EmptyState";
import PageHeader from "@/components/app/PageHeader";
import { SkeletonRows } from "@/components/app/Skeleton";

export default function Memory() {
  const { toast } = useToast();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const user = await base44.auth.me();
    const page = await base44.entities.Memory.filter({ owner_id: user.id }, { sort: "-created_date", limit: 200 });
    setMemories(page.items ?? []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = memories.filter((memory) =>
      !needle || `${memory.contact_name} ${memory.contact_number} ${memory.fact}`.toLowerCase().includes(needle)
    );
    const map = new Map();
    filtered.forEach((memory) => {
      const key = memory.contact_number || memory.contact_name || "unknown";
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: memory.contact_name || "Unknown caller",
          number: memory.contact_number || "—",
          items: [],
        });
      }
      map.get(key).items.push(memory);
    });
    return Array.from(map.values());
  }, [memories, query]);

  const save = async (memory) => {
    const fact = draft.trim();
    if (!fact) return;
    setBusy(true);
    try {
      await base44.entities.Memory.update(memory.id, { fact });
      toast({ title: "Memory updated", description: "The agent will use the new wording from now on." });
      setEditingId(null);
      setDraft("");
      await load();
    } catch (error) {
      toast({ title: "Couldn't update memory", description: error.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (memory) => {
    try {
      await base44.entities.Memory.delete(memory.id);
      toast({ title: "Memory deleted", description: "The agent will forget this detail." });
      await load();
    } catch (error) {
      toast({ title: "Couldn't delete memory", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Workspace"
        title="Memory"
        description="Durable facts the agents remember about each caller. Edit or delete anything that shouldn't stick."
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search facts, names or numbers"
          aria-label="Search memories"
          className="w-full rounded-full border border-white/12 bg-white/[0.06] py-2.5 pl-9 pr-4 text-[12.5px] text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15"
        />
      </div>

      {loading ? (
        <SkeletonRows rows={3} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Brain}
          title={query ? "Nothing matches that search" : "No memories yet"}
          description={
            query
              ? "Try a different name, number or keyword."
              : "Memories appear after a call ends, once the agent extracts durable facts about the caller."
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {groups.map((group) => (
            <GlassCard key={group.key} className="p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-white">{group.name}</p>
                  <p className="font-mono text-[11px] text-white/35">{group.number}</p>
                </div>
                <span className="shrink-0 rounded-full border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/45">
                  {group.items.length} fact{group.items.length === 1 ? "" : "s"}
                </span>
              </div>

              <ul className="mt-3 space-y-2">
                {group.items.map((memory) => (
                  <li key={memory.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    {editingId === memory.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          rows={2}
                          className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-[12.5px] text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                        <div className="flex justify-end gap-1.5">
                          <GlassButton size="sm" tone="quiet" onClick={() => setEditingId(null)} disabled={busy}>
                            Cancel
                          </GlassButton>
                          <GlassButton size="sm" tone="primary" onClick={() => save(memory)} disabled={busy}>
                            Save
                          </GlassButton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12.5px] leading-relaxed text-white/70">{memory.fact}</p>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            aria-label="Edit memory"
                            onClick={() => {
                              setEditingId(memory.id);
                              setDraft(memory.fact);
                            }}
                            className="rounded-full p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete memory"
                            onClick={() => remove(memory)}
                            className="rounded-full p-1.5 text-white/30 transition-colors hover:bg-rose-400/15 hover:text-rose-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}