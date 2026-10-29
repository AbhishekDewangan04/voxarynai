import React, { useEffect, useState } from "react";
import { Brain, ListChecks, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  SENTIMENT_STYLES,
  STATUS_STYLES,
  TASK_STATUS_STYLES,
  TASK_TYPE_LABELS,
  formatDuration,
  formatStamp,
  formatWhen,
} from "@/lib/format";
import { SkeletonRows } from "./Skeleton";

export default function CallDrawer({ call, onClose }) {
  const [lines, setLines] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!call) return undefined;
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      const [linePage, taskPage] = await Promise.all([
        base44.entities.TranscriptLine.filter({ call_id: call.id }, { sort: "timestamp_ms", limit: 200 }),
        base44.entities.Task.filter({ call_id: call.id }, { limit: 50 }),
      ]);
      if (cancelled) return;
      setLines(linePage.items ?? []);
      setTasks(taskPage.items ?? []);
      setLoading(false);
    };

    load();
    const timer = call.status === "live" ? window.setInterval(load, 2500) : null;
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, [call?.id, call?.status]);

  if (!call) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close call details"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      />
      <section
        role="dialog"
        data-lenis-prevent=""
        aria-label={`Call with ${call.caller_name || "unknown caller"}`}
        className="relative m-2 flex h-[calc(100%-1rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#070b18]/95 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-white">{call.caller_name || "Unknown caller"}</p>
            <p className="mt-0.5 font-mono text-[11.5px] text-white/40">{call.caller_number || "—"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[call.status] || STATUS_STYLES.completed}`}>
                {call.status === "live" ? "Live now" : call.status}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${SENTIMENT_STYLES[call.sentiment] || SENTIMENT_STYLES.Neutral}`}>
                {call.sentiment || "Neutral"}
              </span>
              <span className="text-[10.5px] text-white/35">
                {formatWhen(call.started_at)} · {formatDuration(call.duration_seconds)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/40">AI summary</p>
            </div>
            <p className="mt-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-[12.5px] leading-relaxed text-white/70">
              {call.summary || (call.status === "live" ? "The call is still running — a summary lands when it ends." : "No summary captured for this call.")}
            </p>
            {call.intent && <p className="mt-2 text-[11.5px] text-white/40">Intent · {call.intent}</p>}
          </div>

          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/40">Transcript</p>
            <div className="mt-2 space-y-2.5">
              {loading ? (
                <SkeletonRows rows={2} />
              ) : lines.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-[12px] text-white/40">
                  No transcript lines yet.
                </p>
              ) : (
                lines.map((line) => (
                  <div
                    key={line.id}
                    className={`flex ${line.speaker === "agent" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                        line.speaker === "agent"
                          ? "border border-white/12 bg-gradient-to-br from-violet-500/25 to-cyan-400/15 text-white/85"
                          : "border border-white/10 bg-white/[0.06] text-white/70"
                      }`}
                    >
                      <p className="mb-1 text-[9.5px] uppercase tracking-[0.14em] text-white/35">
                        {line.speaker === "agent" ? "Agent" : "Caller"} · {formatStamp(line.timestamp_ms)}
                      </p>
                      {line.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/40">Tasks from this call</p>
            </div>
            <div className="mt-2 space-y-2">
              {loading ? (
                <SkeletonRows rows={1} />
              ) : tasks.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-[12px] text-white/40">
                  Nothing to follow up on.
                </p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                        {TASK_TYPE_LABELS[task.type] || task.type}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9.5px] ${TASK_STATUS_STYLES[task.status] || ""}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/70">{task.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}