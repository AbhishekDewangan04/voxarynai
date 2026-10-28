import React, { useState } from "react";
import { Briefcase, Building2, HeartPulse, House, Quote } from "lucide-react";
import { GlassCard } from "./Glass";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";

const TABS = [
  {
    id: "professionals",
    label: "Professionals",
    icon: Briefcase,
    headline: "Never lose a client to a missed call again.",
    copy: "Consultants, lawyers and freelancers route their line to an agent that qualifies callers, books time and holds context from every earlier conversation.",
    bullets: [
      "Screens unknown numbers and spam automatically",
      "Books discovery calls straight into your calendar",
      "Briefs you with a summary before you dial back",
    ],
    quote: "“I bill for the hours I work, not for the hours I spend arranging them.”",
    metric: ["3.2h", "saved per week"],
  },
  {
    id: "small-business",
    label: "Small business",
    icon: Building2,
    headline: "A front desk that never takes a break.",
    copy: "Salons, agencies and trades answer every enquiry in the first ring, take bookings and send confirmations — even at 11pm on a Sunday.",
    bullets: [
      "Answers FAQs about hours, pricing and location",
      "Sends SMS confirmations and reminders",
      "Escalates urgent calls to a human instantly",
    ],
    quote: "“We went from losing 20% of calls to answering all of them.”",
    metric: ["+41%", "bookings captured"],
  },
  {
    id: "healthcare",
    label: "Healthcare clinics",
    icon: HeartPulse,
    headline: "Reception that protects patient privacy.",
    copy: "Clinics use a scoped agent for scheduling and reminders, with recordings off by default and every permission explicitly granted.",
    bullets: [
      "Books, moves and cancels appointments",
      "Collects intake details before the visit",
      "Never discusses clinical advice — routes it to staff",
    ],
    quote: "“Fewer no-shows, and the front desk finally gets lunch.”",
    metric: ["−28%", "no-show rate"],
  },
  {
    id: "personal",
    label: "Personal life",
    icon: House,
    headline: "Your own assistant, for the boring calls.",
    copy: "Filter spam, chase deliveries, coordinate with family and keep a memory of who said what — all in a voice you actually like.",
    bullets: [
      "Blocks spam and robocalls before they ring",
      "Handles bookings for restaurants and dentists",
      "Keeps a searchable record of every conversation",
    ],
    quote: "“It sounds like me, and it remembers the details I forget.”",
    metric: ["24/7", "personal cover"],
  },
];

export default function UseCases() {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  return (
    <SectionShell
      id="use-cases"
      eyebrow="Use cases"
      title="Built for whoever is on the other end of your line."
      description="Same platform, four very different jobs. Choose a starting point and shape the agent from there."
    >
      {/* tablist */}
      <div role="tablist" aria-label="Use cases" className="mt-10 flex flex-wrap justify-center gap-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = id === activeId;
          return (
            <button
              key={id}
              role="tab"
              id={`tab-${id}`}
              aria-selected={selected}
              aria-controls={`panel-${id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(id)}
              onKeyDown={(event) => {
                const currentIndex = TABS.findIndex((tab) => tab.id === activeId);
                if (event.key === "ArrowRight") setActiveId(TABS[(currentIndex + 1) % TABS.length].id);
                if (event.key === "ArrowLeft") setActiveId(TABS[(currentIndex - 1 + TABS.length) % TABS.length].id);
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[12.5px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                selected
                  ? "border-white/30 bg-white/[0.16] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                  : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
        className="mt-6"
        tabIndex={0}
      >
        <Reveal key={active.id} y={16}>
          <GlassCard className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h3 className="font-display-tight text-[clamp(1.5rem,2.6vw,2.1rem)] text-white">{active.headline}</h3>
              <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/62">{active.copy}</p>
              <ul className="mt-6 space-y-2.5">
                {active.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-[13.5px] text-white/75">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/12 bg-[linear-gradient(140deg,rgba(47,91,255,0.26),rgba(124,58,237,0.2)_55%,rgba(34,211,238,0.2))] p-6">
              <Quote className="h-6 w-6 text-white/40" aria-hidden="true" />
              <p className="mt-4 text-pretty text-[15px] leading-relaxed text-white/90">{active.quote}</p>
              <div className="mt-6 flex items-end gap-2 border-t border-white/15 pt-4">
                <span className="font-display text-3xl font-bold tracking-[-0.04em] text-white">{active.metric[0]}</span>
                <span className="pb-1 text-[11.5px] text-white/55">{active.metric[1]}</span>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </SectionShell>
  );
}