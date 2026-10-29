import React from "react";
import {
  Calendar,
  Database,
  FileText,
  Hash,
  Mail,
  MessageCircle,
  Phone,
  Target,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import { GlassCard } from "./Glass";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";

const INTEGRATIONS = [
  { name: "Google Calendar", detail: "Read & book slots", icon: Calendar, tint: "from-blue-500/30 to-cyan-400/20" },
  { name: "Outlook", detail: "Mail & calendar", icon: Mail, tint: "from-sky-500/30 to-blue-400/20" },
  { name: "Notion", detail: "Notes & docs", icon: FileText, tint: "from-slate-300/25 to-slate-500/20" },
  { name: "Slack", detail: "Team alerts", icon: Hash, tint: "from-fuchsia-500/30 to-violet-500/20" },
  { name: "HubSpot", detail: "Contacts & deals", icon: Target, tint: "from-orange-500/30 to-rose-400/20" },
  { name: "Zapier", detail: "6,000+ apps", icon: Zap, tint: "from-amber-400/30 to-orange-400/20" },
  { name: "MongoDB", detail: "Custom records", icon: Database, tint: "from-emerald-500/30 to-teal-400/20" },
  { name: "Webhooks / API", detail: "Anything you build", icon: Webhook, tint: "from-indigo-500/30 to-blue-400/20" },
  { name: "Twilio", detail: "Numbers & SMS", icon: Phone, tint: "from-rose-500/30 to-red-400/20" },
  { name: "WhatsApp", detail: "Follow-up messages", icon: MessageCircle, tint: "from-emerald-400/30 to-lime-400/20" },
  { name: "Team directory", detail: "Route to humans", icon: Users, tint: "from-violet-500/30 to-fuchsia-400/20" },
];

export default function Integrations() {
  return (
    <SectionShell
      id="integrations"
      eyebrow="Integrations"
      title="Plugs into the tools you already run on."
      description="Authorise an integration once and your agent can read, write and notify inside it — with per-tool permissions you control."
    >
      <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {INTEGRATIONS.map(({ name, detail, icon: Icon, tint }, index) => (
          <li key={name}>
            <Reveal delay={Math.min(index, 6) * 0.04}>
              <GlassCard
                interactive
                className="group flex h-full flex-col gap-4 p-4 transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(47,91,255,0.28)]"
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-gradient-to-br ${tint} text-white`}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[12.5px] font-semibold text-white">{name}</span>
                  <span className="mt-0.5 block text-[10.5px] text-white/40">{detail}</span>
                </span>
              </GlassCard>
            </Reveal>
          </li>
        ))}
      </ul>

      <Reveal delay={0.2}>
        <p className="mt-8 text-center text-[12px] text-white/40">
          Missing something? Build it with the REST API and webhooks — every action is auditable.
        </p>
      </Reveal>
    </SectionShell>
  );
}