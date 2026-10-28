import React from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgentsList({ agents, activeId, onSelect, compact = false }) {
  return (
    <ul className="space-y-1.5">
      {agents.map((agent) => {
        const active = agent.id === activeId;
        return (
          <li key={agent.id}>
            <button
              type="button"
              onClick={() => onSelect(agent.id)}
              aria-pressed={active}
              className={cn(
                "group w-full rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                active
                  ? "border-white/25 bg-white/[0.13] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[11px] font-bold text-white ring-1 ring-white/20"
                  style={{ backgroundColor: `${agent.accent}33` }}
                >
                  {agent.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-white">
                    {agent.name}
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        agent.status === "Live" ? "bg-emerald-300" : "bg-amber-300/80"
                      )}
                    />
                  </p>
                  <p className="truncate text-[11px] text-white/45">{agent.role}</p>
                </div>
                {!compact && <Phone className="h-3.5 w-3.5 shrink-0 text-white/25" aria-hidden="true" />}
              </div>
              {!compact && (
                <p className="mt-2 flex items-center justify-between text-[10.5px] text-white/35">
                  <span className="font-mono">{agent.number}</span>
                  <span>
                    {agent.calls} calls · {Math.round(agent.minutes / 60)}h
                  </span>
                </p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}