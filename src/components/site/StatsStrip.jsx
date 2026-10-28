import React from "react";
import { Clock, Globe, ShieldCheck, Zap } from "lucide-react";
import Reveal from "./Reveal";
import { GlassChip } from "./Glass";

const STATS = [
  { icon: Zap, value: "<300ms", label: "Response latency" },
  { icon: Globe, value: "30+", label: "Languages supported" },
  { icon: Clock, value: "24/7", label: "Always available" },
  { icon: ShieldCheck, value: "99.9%", label: "Platform uptime" },
];

export default function StatsStrip() {
  return (
    <section aria-label="Platform metrics" className="relative pb-6">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal delay={0.05}>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {STATS.map(({ icon: Icon, value, label }) => (
              <li key={label}>
                <GlassChip className="flex h-full w-full items-center gap-3.5 rounded-3xl px-4 py-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/[0.07] text-cyan-200">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[19px] font-bold tracking-[-0.03em] text-white">{value}</span>
                    <span className="block truncate text-[11.5px] font-medium text-white/50">{label}</span>
                  </span>
                </GlassChip>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}