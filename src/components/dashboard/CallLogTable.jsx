import React from "react";
import { cn } from "@/lib/utils";

const sentimentTone = {
  Positive: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  Neutral: "border-sky-300/25 bg-sky-400/10 text-sky-200",
  Blocked: "border-rose-300/25 bg-rose-400/10 text-rose-200",
};

export default function CallLogTable({ calls, activeId, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <caption className="sr-only">Recent calls handled by your agents</caption>
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.16em] text-white/35">
            <th scope="col" className="pb-2 pl-1 font-medium">Caller</th>
            <th scope="col" className="pb-2 font-medium">Intent</th>
            <th scope="col" className="hidden pb-2 font-medium sm:table-cell">Duration</th>
            <th scope="col" className="pb-2 font-medium">Sentiment</th>
            <th scope="col" className="pb-2 pr-1 text-right font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => {
            const active = call.id === activeId;
            return (
              <tr
                key={call.id}
                onClick={() => onSelect(call.id)}
                tabIndex={0}
                role="button"
                aria-pressed={active}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(call.id);
                  }
                }}
                className={cn(
                  "cursor-pointer border-t border-white/8 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                  active ? "bg-white/[0.09]" : "hover:bg-white/[0.05]"
                )}
              >
                <td className="py-2.5 pl-1 pr-3">
                  <p className="text-[12.5px] font-medium text-white">{call.caller}</p>
                  <p className="font-mono text-[10px] text-white/35">{call.number}</p>
                </td>
                <td className="pr-3 text-[12px] text-white/65">{call.intent}</td>
                <td className="hidden pr-3 font-mono text-[11.5px] text-white/50 sm:table-cell">{call.duration}</td>
                <td className="pr-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      sentimentTone[call.sentiment] ?? sentimentTone.Neutral
                    )}
                  >
                    {call.sentiment}
                  </span>
                </td>
                <td className="pr-1 text-right font-mono text-[11px] text-white/40">{call.time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}