import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { GlassButton, GlassCard } from "./Glass";
import SquishyCard from "@/components/ui/squishy-card";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";

const PLANS = [
  {
    name: "Starter",
    monthly: 29,
    yearly: 23,
    tagline: "For testing a real agent on a real line.",
    features: [
      "1 AI agent",
      "300 call minutes / month",
      "Conversational memory · 30 days",
      "1 phone number",
      "Calendar + email integrations",
      "Transcripts and AI summaries",
    ],
    cta: "Start with Starter",
    highlight: false,
  },
  {
    name: "Pro",
    monthly: 79,
    yearly: 63,
    tagline: "For people whose phone is part of the job.",
    features: [
      "3 AI agents",
      "1,500 call minutes / month",
      "Unlimited memory + custom voice",
      "Custom number + call forwarding",
      "All integrations incl. HubSpot & Zapier",
      "Task automation & human hand-off",
      "Priority latency routing",
    ],
    cta: "Choose Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    yearly: null,
    tagline: "For teams with compliance in the room.",
    features: [
      "Unlimited agents and minutes",
      "SSO, audit exports & retention policies",
      "Private model routing & data residency",
      "Dedicated onboarding engineer",
      "SLA with 99.99% uptime",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <SectionShell
      id="pricing"
      eyebrow="Pricing"
      title="Pay for the calls you hand over."
      description="Every plan includes real-time voice, memory and transcripts. Change or cancel at any time."
    >
      <Reveal className="mt-8 flex justify-center">
        <div
          className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.05] p-1 backdrop-blur-md"
          role="group"
          aria-label="Billing period"
        >
          {[
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly · save 20%" },
          ].map((option) => {
            const selected = (option.id === "yearly") === yearly;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setYearly(option.id === "yearly")}
                aria-pressed={selected}
                className={`cursor-target relative rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  selected ? "text-[#05060f]" : "text-white/55 hover:text-white"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:items-stretch">
        {PLANS.map((plan, index) => {
          const cardElement = (
            <GlassCard
              className={`relative flex h-full flex-col p-6 sm:p-7 ${
                plan.highlight ? "border-white/30 bg-white/[0.12] shadow-[0_40px_90px_-40px_rgba(124,58,237,0.85)]" : ""
              }`}
            >
              {plan.highlight && (
                <>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(140deg,rgba(124,58,237,0.35),transparent_45%,rgba(34,211,238,0.28))]"
                  />
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-gradient-to-r from-violet-500 to-blue-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-lg">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Most popular
                  </span>
                </>
              )}

              <div className="relative">
                <h3 className="font-display text-[17px] font-semibold text-white">{plan.name}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/50">{plan.tagline}</p>

                <div className="mt-6 flex items-end gap-1.5">
                  {plan.monthly === null ? (
                    <span className="font-display-tight text-4xl text-white">Custom</span>
                  ) : (
                    <>
                      <span className="font-display-tight text-5xl text-white">${yearly ? plan.yearly : plan.monthly}</span>
                      <span className="pb-1.5 text-[12px] text-white/45">/ month</span>
                    </>
                  )}
                </div>
                <p className="mt-1.5 h-4 text-[11px] text-white/35">
                  {plan.monthly === null ? "Annual agreement" : yearly ? `Billed $${plan.yearly * 12} yearly` : "Billed monthly"}
                </p>

                <div className="mt-6">
                  <GlassButton size="md" tone={plan.highlight ? "primary" : "default"} className="w-full">
                    <a href="#waitlist" className="cursor-target inline-flex w-full items-center justify-center">
                      {plan.cta}
                    </a>
                  </GlassButton>
                </div>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-white/70">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/12 text-cyan-200">
                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          );

          return (
            <Reveal key={plan.name} delay={index * 0.06}>
              {plan.highlight ? (
                <SquishyCard className="h-full">
                  {cardElement}
                </SquishyCard>
              ) : (
                cardElement
              )}
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.15}>
        <p className="mt-7 text-center text-[11.5px] text-white/35">
          Overage billed at $0.09 / minute · unused minutes roll over for 30 days · cancel anytime
        </p>
      </Reveal>
    </SectionShell>
  );
}