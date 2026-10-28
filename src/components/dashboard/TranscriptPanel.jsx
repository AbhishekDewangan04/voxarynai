import React from "react";
import { cn } from "@/lib/utils";

export default function TranscriptPanel({ call, className, maxHeight = "18rem" }) {
  if (!call) return null;
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Transcript</p>
        <span className="font-mono text-[10.5px] text-white/35">{call.duration} · {call.agent}</span>
      </div>
      <div className="thin-scroll mt-3 space-y-2.5 overflow-y-auto pr-1" style={{ maxHeight }}>
        {call.transcript.map((line, i) => {
          const agent = line.who === "agent";
          return (
            <div key={`${call.id}-${i}`} className={cn("flex", agent ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed",
                  agent
                    ? "border border-blue-300/20 bg-gradient-to-br from-blue-500/20 to-violet-500/15 text-white/90"
                    : "border border-white/10 bg-white/[0.06] text-white/75"
                )}
              >
                <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  {agent ? call.agent : call.caller}
                </span>
                {line.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}