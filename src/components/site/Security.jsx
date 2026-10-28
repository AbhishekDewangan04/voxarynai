import React, { useState } from "react";
import { Lock, ShieldCheck, EyeOff, KeyRound } from "lucide-react";
import { GlassCard, GlassPanel } from "./Glass";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";

const PERMISSIONS = [
  { id: "calendar", label: "Book appointments", detail: "Create and move calendar events", on: true },
  { id: "crm", label: "Read contacts", detail: "Look up names and history", on: true },
  { id: "sms", label: "Send confirmations", detail: "Text callers a summary", on: true },
  { id: "transfer", label: "Transfer to a human", detail: "Warm hand-off when unsure", on: true },
  { id: "payments", label: "Take payments", detail: "Charge a saved card", on: false },
  { id: "delete", label: "Delete records", detail: "Remove contacts or events", on: false },
];

const PRIVACY = [
  { icon: Lock, title: "Recordings off by default", copy: "Audio is only kept if you explicitly enable retention for an agent." },
  { icon: KeyRound, title: "Scoped credentials", copy: "Every integration token is limited to the exact actions you allowed." },
  { icon: EyeOff, title: "Inspectable memory", copy: "Read, edit or delete anything your agent remembers, any time." },
  { icon: ShieldCheck, title: "Full audit trail", copy: "Every task your agent performs is logged with the call that caused it." },
];

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a17] ${
        checked
          ? "border-emerald-300/40 bg-emerald-400/35"
          : "border-white/15 bg-white/[0.08]"
      }`}
    >
      <span
        className={`inline-block transform rounded-full bg-white shadow transition-transform duration-300 ${
          checked ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
        style={{ height: 18, width: 18 }}
      />
    </button>
  );
}

export default function Security() {
  const [permissions, setPermissions] = useState(
    Object.fromEntries(PERMISSIONS.map((permission) => [permission.id, permission.on]))
  );
  const [recording, setRecording] = useState(false);

  const granted = Object.values(permissions).filter(Boolean).length;

  return (
    <SectionShell
      id="security"
      eyebrow="Security & control"
      title="Authorised tasks only."
      description="Your agent can only do what you switch on. Nothing else — no exceptions, no hidden defaults."
    >
      <div className="mt-14 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <Reveal>
          <GlassPanel className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Agent permissions</p>
                <p className="mt-1 font-display text-lg font-semibold text-white">Aria · personal concierge</p>
              </div>
              <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-[11px] font-medium text-white/60">
                {granted} of {PERMISSIONS.length} enabled
              </span>
            </div>

            <ul className="mt-6 divide-y divide-white/8">
              {PERMISSIONS.map((permission) => (
                <li key={permission.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-white">{permission.label}</p>
                    <p className="mt-0.5 text-[11.5px] text-white/40">{permission.detail}</p>
                  </div>
                  <Toggle
                    checked={permissions[permission.id]}
                    onChange={(value) => setPermissions((prev) => ({ ...prev, [permission.id]: value }))}
                    label={permission.label}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3.5">
              <div>
                <p className="text-[13px] font-medium text-white">Call recording</p>
                <p className="mt-0.5 text-[11.5px] text-white/45">
                  {recording ? "Audio retained for 30 days, then deleted." : "Off — transcripts only, audio discarded after the call."}
                </p>
              </div>
              <Toggle checked={recording} onChange={setRecording} label="Call recording" />
            </div>
          </GlassPanel>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2">
          {PRIVACY.map(({ icon: Icon, title, copy }, index) => (
            <Reveal key={title} delay={index * 0.05}>
              <GlassCard className="h-full p-5">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/[0.07] text-cyan-200">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[13px] font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/50">{copy}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}