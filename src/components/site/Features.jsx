import React from "react";
import { Brain, CalendarClock, Check, LayoutDashboard, Plug, Sparkles, Waves } from "lucide-react";
import { GlassCard } from "./Glass";
import ShimmerBorderCard from "@/components/ui/shimmer-border-card";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";
import Waveform from "./Waveform";

function CardHeader({ icon: Icon, title, description }) {
  return (
    <div>
      <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/[0.07] text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-display text-[19px] font-semibold tracking-[-0.02em] text-white">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-white/58">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <SectionShell
      id="features"
      eyebrow="Core capabilities"
      title="One agent. Every call handled."
      description="Voxaryn listens, reasons and acts in real time — so your phone stops being a to-do list and starts being an employee."
      contentClassName="mt-14"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        {/* AI Voice Calls — large */}
        <Reveal className="md:col-span-2 lg:col-span-7">
          <GlassCard className="flex h-full flex-col justify-between gap-7 p-6 sm:p-8">
            <CardHeader
              icon={Waves}
              title="AI Voice Calls"
              description="Your agent answers every call and converses naturally in real time — interruptions, accents and background noise included."
            />
            <div className="rounded-3xl border border-white/10 bg-[linear-gradient(120deg,rgba(47,91,255,0.28),rgba(124,58,237,0.22)_48%,rgba(34,211,238,0.26))] p-4">
              <div className="flex items-center justify-between text-[11px] text-white/60">
                <span className="font-mono">incoming · +1 (628) 555-0117</span>
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 font-semibold text-emerald-200">answered in 0.9s</span>
              </div>
              <div className="mt-3 h-16">
                <Waveform bars={44} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Interruption handling", "Noise suppression", "Voice cloning"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white/70">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </Reveal>

        {/* Personality */}
        <Reveal delay={0.06} className="lg:col-span-5">
          <ShimmerBorderCard className="h-full">
            <GlassCard className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
              <CardHeader
                icon={Sparkles}
                title="Custom AI Personality"
                description="Shape personality, voice, language and behaviour until it sounds exactly like the version of you that never gets tired."
              />
              <div className="space-y-2">
                {[
                  ["Voice", "Warm · Nova"],
                  ["Language", "English + Spanish"],
                  ["Behaviour", "Concise, never pushy"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5">
                    <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-white/40">{label}</span>
                    <span className="text-[12.5px] font-medium text-white/80">{value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </ShimmerBorderCard>
        </Reveal>

        {/* Memory — large */}
        <Reveal delay={0.04} className="md:col-span-2 lg:col-span-7">
          <GlassCard className="flex h-full flex-col justify-between gap-7 p-6 sm:p-8">
            <CardHeader
              icon={Brain}
              title="Conversational Memory"
              description="Every call adds to a living memory. Your agent recalls names, preferences and open threads — without you repeating a thing."
            />
            <ol className="relative space-y-3 pl-6">
              <span className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-300/60 via-blue-400/40 to-transparent" aria-hidden="true" />
              {[
                ["14 May", "Mentioned she travels for work on Fridays."],
                ["2 Jun", "Asked for afternoon slots only."],
                ["Today", "Offered Tuesday 3pm before she asked."],
              ].map(([date, text], i) => (
                <li key={date} className="relative">
                  <span className={`absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full ${i === 2 ? "bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" : "bg-white/35"}`} aria-hidden="true" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">{date}</p>
                  <p className="mt-0.5 text-[13.5px] leading-relaxed text-white/75">{text}</p>
                </li>
              ))}
            </ol>
          </GlassCard>
        </Reveal>

        {/* Automation */}
        <Reveal delay={0.08} className="lg:col-span-5">
          <ShimmerBorderCard className="h-full">
            <GlassCard className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
              <CardHeader
                icon={CalendarClock}
                title="Task Automation"
                description="Schedule appointments, collect information, send notifications — only the actions you've authorised."
              />
              <ul className="space-y-2">
                {["Booked Tue 3:00pm with Dr. Lin", "Collected insurance details", "Texted confirmation to Maya"].map((task) => (
                  <li key={task} className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-400/20 text-emerald-200">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="text-[12.5px] leading-snug text-white/75">{task}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </ShimmerBorderCard>
        </Reveal>

        {/* Dashboard */}
        <Reveal delay={0.05} className="lg:col-span-6">
          <ShimmerBorderCard className="h-full">
            <GlassCard className="h-full p-6 sm:p-8">
              <CardHeader
                icon={LayoutDashboard}
                title="AI Dashboard"
                description="Manage agents, monitor live calls, replay transcripts and read AI-generated summaries the moment a call ends."
              />
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  ["418", "calls"],
                  ["96", "tasks"],
                  ["31h", "saved"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-center">
                    <p className="font-display text-lg font-bold text-white">{value}</p>
                    <p className="text-[10.5px] uppercase tracking-[0.14em] text-white/40">{label}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </ShimmerBorderCard>
        </Reveal>

        {/* Integrations */}
        <Reveal delay={0.09} className="lg:col-span-6">
          <ShimmerBorderCard className="h-full">
            <GlassCard className="h-full p-6 sm:p-8">
              <CardHeader
                icon={Plug}
                title="Integrations"
                description="Connect calendars, databases and the external services your work already lives in."
              />
              <div className="mt-6 flex flex-wrap gap-2">
                {["Google Calendar", "Outlook", "Notion", "Slack", "HubSpot", "Zapier", "MongoDB", "Webhooks"].map((name) => (
                  <span key={name} className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[11.5px] font-medium text-white/70">
                    {name}
                  </span>
                ))}
              </div>
            </GlassCard>
          </ShimmerBorderCard>
        </Reveal>
      </div>
    </SectionShell>
  );
}