import React, { useEffect, useState } from "react";
import { Pause, Sparkles, Volume2 } from "lucide-react";
import { GlassButton, GlassPanel } from "./Glass";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";
import Waveform from "./Waveform";

const VOICES = ["Warm", "Professional", "Playful", "Calm"];
const LANGUAGES = ["English (US)", "Spanish (ES)", "French (FR)", "German (DE)", "Hindi (HI)", "Arabic (AR)"];
const TONES = ["Reassuring", "Direct", "Curious"];

const VOICE_LINE = {
  Warm: "Hey there — this is Aria, answering for Marcus. I'm really glad you called.",
  Professional: "Good afternoon, you've reached Marcus's office. This is Aria speaking.",
  Playful: "Hey hey, Aria here running Marcus's phone — what do you need?",
  Calm: "Hello. This is Aria, answering for Marcus. There's no rush at all.",
};

const TONE_LINE = {
  Reassuring: "Whatever it is, we'll take it one step at a time.",
  Direct: "Tell me exactly what you need and I'll get it sorted.",
  Curious: "I'd love to hear what's on your mind — what brings you here today?",
};

const TRANSLATED = {
  "Spanish (ES)": { text: "Hola, has llamado a la línea de Marcus. Soy Aria, ¿en qué puedo ayudarte hoy?", lang: "es-ES" },
  "French (FR)": { text: "Bonjour, vous êtes bien chez Marcus. Ici Aria, comment puis-je vous aider ?", lang: "fr-FR" },
  "German (DE)": { text: "Guten Tag, Sie erreichen Marcus. Hier spricht Aria. Wie kann ich helfen?", lang: "de-DE" },
  "Hindi (HI)": { text: "नमस्ते, यह मार्कस की लाइन है। मैं एरिया हूँ — मैं आपकी कैसे मदद कर सकती हूँ?", lang: "hi-IN" },
  "Arabic (AR)": { text: "مرحبًا، هذه خط ماركوس. أنا آريا — كيف يمكنني مساعدتك اليوم؟", lang: "ar-SA" },
};

function Chip({ active, children, onClick }) {
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

export default function PersonalityStudio() {
  const [voice, setVoice] = useState("Warm");
  const [language, setLanguage] = useState("English (US)");
  const [tone, setTone] = useState("Reassuring");
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const translation = TRANSLATED[language];
  const greeting = translation ? translation.text : `${VOICE_LINE[voice]} ${TONE_LINE[tone]}`;

  const speak = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(greeting);
    utterance.lang = translation?.lang ?? "en-US";
    utterance.rate = 0.98;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  };

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return (
    <SectionShell
      id="studio"
      eyebrow="Personality studio"
      title="Design the voice before you commit."
      description="Pick a voice, a language and a tone. The greeting below rewrites itself instantly — this is exactly the control you get over every agent."
    >
      <div className="relative mt-14">
        <div
          aria-hidden="true"
          className="absolute -inset-x-6 -inset-y-10 -z-10 bg-[radial-gradient(50%_60%_at_20%_20%,rgba(124,58,237,0.4),transparent_70%),radial-gradient(45%_55%_at_80%_75%,rgba(34,211,238,0.32),transparent_72%)] blur-[50px]"
        />
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <GlassPanel className="h-full space-y-7 p-6 sm:p-8">
              <Group label="Voice">
                {VOICES.map((option) => (
                  <Chip key={option} active={voice === option} onClick={() => setVoice(option)}>
                    {option}
                  </Chip>
                ))}
              </Group>
              <Group label="Language">
                {LANGUAGES.map((option) => (
                  <Chip key={option} active={language === option} onClick={() => setLanguage(option)}>
                    {option}
                  </Chip>
                ))}
              </Group>
              <Group label="Tone">
                {TONES.map((option) => (
                  <Chip key={option} active={tone === option} onClick={() => setTone(option)}>
                    {option}
                  </Chip>
                ))}
              </Group>
              <p className="text-[12px] leading-relaxed text-white/40">
                {translation
                  ? "Translated greetings use the same personality rules — the tone chips shape how the agent behaves in any language."
                  : "Voice and tone are independent: a playful voice can still deliver direct answers."}
              </p>
            </GlassPanel>
          </Reveal>

          <Reveal delay={0.08}>
            <GlassPanel className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/40 to-cyan-400/25 text-white ring-1 ring-white/25">
                    <Sparkles className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-white">Aria · preview</p>
                    <p className="text-[11.5px] text-white/50">
                      {voice} · {tone} · {language}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  sample
                </span>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(47,91,255,0.2),rgba(124,58,237,0.16)_55%,rgba(34,211,238,0.18))] p-5">
                <p
                  dir={language === "Arabic (AR)" ? "rtl" : "ltr"}
                  className="text-pretty text-[17px] leading-relaxed text-white sm:text-[19px]"
                >
                  “{greeting}”
                </p>
                <div className="mt-5 h-10">
                  <Waveform bars={30} active={speaking} tone="soft" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {supported && (
                  <GlassButton size="sm" onClick={speak} aria-pressed={speaking}>
                    {speaking ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    {speaking ? "Stop sample" : "Hear this greeting"}
                  </GlassButton>
                )}
                <a
                  href="#waitlist"
                  className="rounded-full px-3.5 py-2 text-[12.5px] font-medium text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  Save this agent →
                </a>
              </div>
            </GlassPanel>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}