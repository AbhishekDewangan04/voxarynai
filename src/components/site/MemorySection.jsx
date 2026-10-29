import React from "react";
import { ArrowRight, Brain, MessageSquare, Sparkles } from "lucide-react";
import { GlassCard, GlassChip } from "./Glass";
import TiltShineCard from "@/components/ui/tilt-shine-card";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";

const STEPS = [
  {
    icon: MessageSquare,
    label: "Previous conversation",
    date: "14 May · 09:12",
    quote: "“I'm travelling most Fridays, so mornings are easier for me.”",
    tag: "Captured",
  },
  {
    icon: Brain,
    label: "Remembered detail",
    date: "Stored as memory #4821",
    quote: "Prefers morning appointments · avoids Fridays · Dr. Lin",
    tag: "Indexed",
  },
  {
    icon: Sparkles,
    label: "Used in the next call",
    date: "2 Jun · 16:40",
    quote: "“I've held Thursday 9:30 for you — I know Fridays are difficult.”",
    tag: "Applied",
  },
];

export default function MemorySection() {
  return (
    <SectionShell
      id="memory"
      eyebrow="Conversational memory"
      title="It remembers, so you don't have to repeat yourself."
      description="Details from one call become context for the next. Your agent builds a private, inspectable memory of the people and preferences in your life."
    >
      <div className="relative mt-14">
        <div
          aria-hidden="true"
          className="absolute inset-x-8 top-1/2 -z-10 hidden h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent lg:block"
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
          {STEPS.map(({ icon: Icon, label, date, quote, tag }, index) => (
            <React.Fragment key={label}>
              <Reveal delay={index * 0.08}>
                <TiltShineCard className="h-full">
                  <GlassCard className="h-full p-6">
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-gradient-to-br from-violet-500/30 to-cyan-400/20 text-white">
                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                      </span>
                      <GlassChip className="rounded-full px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white/55">
                        {tag}
                      </GlassChip>
                    </div>
                    <h3 className="mt-5 font-display text-[15.5px] font-semibold text-white">{label}</h3>
                    <p className="mt-0.5 font-mono text-[10.5px] text-white/35">{date}</p>
                    <p className="mt-4 text-[13.5px] leading-relaxed text-white/70">{quote}</p>
                  </GlassCard>
                </TiltShineCard>
              </Reveal>
              {index < STEPS.length - 1 && (
                <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/50">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <Reveal delay={0.16}>
          <p className="mt-6 text-center text-[12px] text-white/40">
            Every memory is visible, editable and deletable from your dashboard — nothing is hidden inside a black box.
          </p>
        </Reveal>
      </div>
    </SectionShell>
  );
}