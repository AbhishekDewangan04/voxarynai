import React from "react";
import { MicVocal, PhoneCall, SlidersHorizontal, UserPlus } from "lucide-react";
import { GlassCard } from "./Glass";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your agent",
    copy: "Start from a blank agent or a template. Give it a name, a purpose and the identity it should carry.",
  },
  {
    icon: SlidersHorizontal,
    title: "Shape personality & voice",
    copy: "Pick a voice, a language and a tone. Add the rules it must never break on a call.",
  },
  {
    icon: MicVocal,
    title: "Connect your number & tools",
    copy: "Forward your line or buy a new number, then authorise calendars, CRM and notifications.",
  },
  {
    icon: PhoneCall,
    title: "Let it handle your calls",
    copy: "Your agent answers instantly, takes action and sends you a summary with every task it completed.",
  },
];

export default function HowItWorks() {
  return (
    <SectionShell
      id="how-it-works"
      eyebrow="How it works"
      title="Live in under ten minutes."
      description="No telephony setup, no prompt engineering degree. Four steps from silent phone to answered calls."
    >
      <div className="relative mt-16">
        {/* connecting glowing rail */}
        <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-3 hidden lg:block">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
          <div className="absolute inset-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent blur-[3px]" />
          <div className="grid grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex justify-center">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.95)]"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
              </div>
            ))}
          </div>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:pt-12">
          {STEPS.map(({ icon: Icon, title, copy }, index) => (
            <Reveal key={title} delay={index * 0.07}>
              <GlassCard className="h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-gradient-to-br from-blue-500/25 to-violet-500/20 text-white">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.2em] text-white/35">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-[16.5px] font-semibold tracking-[-0.01em] text-white">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/58">{copy}</p>
              </GlassCard>
            </Reveal>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}