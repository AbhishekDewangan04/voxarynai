import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, Mic, Pause, Play, Radio } from "lucide-react";
import { GlassChip, GlassPanel } from "./Glass";
import Waveform from "./Waveform";

const SCRIPT = [
  { who: "caller", text: "Hey Aria — I need to move my cleaning on Thursday." },
  { who: "agent", text: "Hi Marcus. You're booked with Dr. Lin at 9:30. Tuesday at 3pm just opened — shall I move you?" },
  { who: "caller", text: "Tuesday works. Same dentist?" },
  { who: "agent", text: "Same dentist. Moved to Tuesday 3pm and texted you the confirmation." },
];

const formatTime = (total) => {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function HeroCallCard({ playing, onToggle }) {
  const reduceMotion = useReducedMotion();
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);
  const [seconds, setSeconds] = useState(132);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (reduceMotion) {
      setLine(SCRIPT.length);
      return undefined;
    }
    if (!playing) return undefined;
    const current = SCRIPT[line];
    if (!current) {
      const restart = setTimeout(() => {
        setLine(0);
        setChars(0);
      }, 3200);
      return () => clearTimeout(restart);
    }
    if (chars < current.text.length) {
      const typing = setTimeout(() => setChars((c) => c + 1), 32);
      return () => clearTimeout(typing);
    }
    const next = setTimeout(() => {
      setLine((l) => l + 1);
      setChars(0);
    }, 900);
    return () => clearTimeout(next);
  }, [playing, line, chars, reduceMotion]);

  useEffect(() => {
    if (!playing || reduceMotion) return undefined;
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [playing, reduceMotion]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [line, chars]);

  const completed = SCRIPT.slice(0, line);
  const active = SCRIPT[line];
  const activeText = active ? active.text.slice(0, chars) : "";
  const booked = line >= 3;

  return (
    <div className="relative">
      <GlassPanel className="p-5 sm:p-6" refraction={28}>
        {/* call header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/40 via-blue-500/30 to-cyan-400/30 text-[13px] font-semibold tracking-wide text-white ring-1 ring-white/25">
              MO
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0d1c] bg-emerald-400" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-white">Maya Okafor</p>
              <p className="truncate text-xs text-white/55">+1 (628) 555-0117 · Aria</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </span>
              Live
            </span>
            <span className="font-mono text-xs tabular-nums text-white/60">{formatTime(seconds)}</span>
          </div>
        </div>

        {/* waveform */}
        <div className="relative mt-5 h-20 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(47,91,255,0.22),rgba(124,58,237,0.18)_45%,rgba(34,211,238,0.2))] px-4">
          <div className="absolute inset-0 grain-overlay opacity-[0.12]" />
          <Waveform bars={40} active={playing} />
          <button
            type="button"
            onClick={onToggle}
            aria-label={playing ? "Pause the demo call" : "Play the demo call"}
            className="absolute bottom-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
          </button>
        </div>

        {/* transcript */}
        <div
          ref={scrollRef}
          className="thin-scroll mt-4 h-[168px] space-y-2.5 overflow-y-auto pr-1"
          aria-live="polite"
          aria-label="Live call transcript"
        >
          {completed.map((entry, i) => (
            <Bubble key={`done-${i}`} who={entry.who} text={entry.text} />
          ))}
          {active && (
            <Bubble who={active.who} text={activeText} typing={chars < active.text.length} />
          )}
          {!active && (
            <p className="pt-2 text-center text-[11px] uppercase tracking-[0.18em] text-white/40">
              Call ended · summary ready
            </p>
          )}
        </div>

        {/* footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <MetaChip icon={Mic} label="Noise clean" />
            <MetaChip icon={Radio} label="Barge-in" />
          </div>
          <span className="font-mono text-[11px] text-white/45">248 ms · en-US</span>
        </div>
      </GlassPanel>

      {/* floating booked chip */}
      <AnimatePresence>
        {booked && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="absolute -bottom-5 right-3 sm:-right-4"
          >
            <GlassChip className="flex items-center gap-2 px-3.5 py-2 text-[12px] font-medium text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)]">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/20 text-emerald-200">
                <CalendarCheck className="h-3.5 w-3.5" />
              </span>
              Booked: Dentist, Tue 3PM
            </GlassChip>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Bubble = React.memo(function Bubble({ who, text, typing = false }) {
  const isAgent = who === "agent";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[86%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed ${
          isAgent
            ? "border border-blue-300/25 bg-gradient-to-br from-blue-500/25 to-violet-500/20 text-white"
            : "border border-white/10 bg-white/[0.07] text-white/85"
        }`}
      >
        <span className="mb-0.5 block text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/45">
          {isAgent ? "Aria" : "Maya"}
        </span>
        {text}
        {typing && <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-[2px] animate-caret-blink bg-white/80" />}
      </div>
    </motion.div>
  );
});

function MetaChip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1 text-[10.5px] font-medium text-white/60">
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}