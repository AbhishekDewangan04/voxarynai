import React from "react";
import { Quote, Star } from "lucide-react";
import { GlassCard } from "./Glass";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";

const TESTIMONIALS = [
  {
    initials: "RN",
    name: "Rhea Nair",
    role: "Independent consultant · Bengaluru",
    quote:
      "I stopped losing leads to voicemail. Aria qualifies them, books the call, and by the time I open my laptop there's a summary waiting with everything I need.",
    metric: "31 calls handled in week one",
    accent: "from-violet-500/40 to-blue-500/20",
  },
  {
    initials: "DM",
    name: "Daniel Mercer",
    role: "Owner · Northside Dental",
    quote:
      "Our front desk used to ring out during procedures. Now every patient gets answered, reschedules happen automatically, and no-shows are down by a quarter.",
    metric: "−28% no-shows",
    accent: "from-blue-500/40 to-cyan-400/20",
  },
  {
    initials: "SL",
    name: "Sofia Lindqvist",
    role: "Head of Sales · Fintra",
    quote:
      "We cloned our best rep's tone and rolled it to three languages in an afternoon. Prospects genuinely thank us for the follow-up calls now.",
    metric: "3 languages, one agent",
    accent: "from-cyan-400/40 to-fuchsia-500/20",
  },
];

export default function Testimonials() {
  return (
    <SectionShell
      id="testimonials"
      eyebrow="Early access"
      title="People who stopped missing calls."
      description="From solo consultants to clinics and sales teams — these are the first hundred lines running on Voxaryn."
    >
      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {TESTIMONIALS.map((item, index) => (
          <Reveal key={item.name} delay={index * 0.07}>
            <GlassCard className="flex h-full flex-col justify-between gap-6 p-6 sm:p-7">
              <div>
                <div className="flex items-center gap-1" aria-label="Rated 5 out of 5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" aria-hidden="true" />
                  ))}
                </div>
                <Quote className="mt-4 h-5 w-5 text-white/25" aria-hidden="true" />
                <blockquote className="mt-2 text-pretty text-[14px] leading-relaxed text-white/80">{item.quote}</blockquote>
              </div>
              <div>
                <span className="inline-flex rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[10.5px] font-medium text-cyan-200">
                  {item.metric}
                </span>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-white/8 pt-4">
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${item.accent} text-[11px] font-bold text-white ring-1 ring-white/25`}
                  >
                    {item.initials}
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-semibold text-white">{item.name}</span>
                    <span className="block text-[11px] text-white/40">{item.role}</span>
                  </span>
                </figcaption>
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}