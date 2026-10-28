import React from "react";
import { Check, Sparkles } from "lucide-react";

export default function SummaryCard({ call }) {
  if (!call) return null;
  return (
    <div className="rounded-2xl border border-white/12 bg-[linear-gradient(140deg,rgba(124,58,237,0.22),rgba(47,91,255,0.14)_55%,rgba(34,211,238,0.16))] p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/15 text-white ring-1 ring-white/25">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">AI summary</p>
        <span className="ml-auto rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.12em] text-white/60">
          auto
        </span>
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-white/80">{call.summary}</p>
      <ul className="mt-3 space-y-1.5">
        {call.tasks.map((task) => (
          <li key={task} className="flex items-start gap-2 text-[11.5px] text-white/65">
            <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-emerald-400/25 text-emerald-200">
              <Check className="h-2.5 w-2.5" aria-hidden="true" />
            </span>
            {task}
          </li>
        ))}
      </ul>
    </div>
  );
}