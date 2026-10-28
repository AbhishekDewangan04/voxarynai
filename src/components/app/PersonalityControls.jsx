import React from "react";
import { Sparkles } from "lucide-react";
import { LANGUAGES, TONES, VOICES, isRtl } from "@/lib/agentOptions";

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
        active
          ? "border-white/35 bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_24px_-14px_rgba(124,58,237,0.9)]"
          : "border-white/12 bg-white/[0.04] text-white/60 hover:border-white/25 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ label, children }) {
  return (
    <div>
      <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/40">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function PersonalityControls({ value, onChange, greeting }) {
  return (
    <div className="space-y-5">
      <Group label="Voice">
        {VOICES.map((option) => (
          <Chip key={option} active={value.voice === option} onClick={() => onChange("voice", option)}>
            {option}
          </Chip>
        ))}
      </Group>
      <Group label="Language">
        {LANGUAGES.map((option) => (
          <Chip key={option} active={value.language === option} onClick={() => onChange("language", option)}>
            {option}
          </Chip>
        ))}
      </Group>
      <Group label="Tone">
        {TONES.map((option) => (
          <Chip key={option} active={value.tone === option} onClick={() => onChange("tone", option)}>
            {option}
          </Chip>
        ))}
      </Group>

      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(47,91,255,0.18),rgba(124,58,237,0.14)_55%,rgba(34,211,238,0.16))] p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Live greeting</p>
        </div>
        <p
          dir={isRtl(value.language) ? "rtl" : "ltr"}
          className="mt-2 text-pretty text-[14px] leading-relaxed text-white/85"
        >
          “{greeting}”
        </p>
      </div>
    </div>
  );
}