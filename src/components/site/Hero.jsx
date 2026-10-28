import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight, ArrowUpRight, Brain, Pause, Play, Sparkles, Zap } from "lucide-react";
import { GlassButton } from "./Glass";
import Reveal from "./Reveal";
import HeroCallCard from "./HeroCallCard";

const META = [
  { icon: Zap, label: "<300ms replies" },
  { icon: Brain, label: "Remembers every call" },
  { icon: Sparkles, label: "30+ languages" },
];

export default function Hero() {
  const [playing, setPlaying] = useState(true);
  const [pointerInside, setPointerInside] = useState(false);
  const stageRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const springX = useSpring(0, { stiffness: 80, damping: 16, mass: 0.7 });
  const springY = useSpring(0, { stiffness: 80, damping: 16, mass: 0.7 });

  const handlePointerMove = (event) => {
    if (reduceMotion || event.pointerType !== "mouse" || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    springX.set(event.clientX - rect.left - 58);
    springY.set(event.clientY - rect.top - 20);
    setPointerInside(true);
  };

  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-10 sm:pt-14 lg:pb-24 lg:pt-16">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 xl:gap-16">
          {/* copy */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-2 pr-4 text-[11.5px] font-medium text-white/75 backdrop-blur-md">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500/40 to-blue-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  New
                </span>
                Voice agents that actually sound like you
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="font-display-tight mt-6 text-[clamp(2.65rem,7.2vw,5.1rem)] text-white">
                Your AI.
                <br />
                Your Identity.
                <br />
                <span className="text-gradient">Your Rules.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-pretty text-[16px] leading-relaxed text-white/65 sm:text-[17px]">
                Create a personal AI voice agent that answers your calls, talks like you want, remembers every
                conversation, and handles tasks on your behalf.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <GlassButton size="lg" tone="primary" className="group">
                  <Link to="/register?returnTo=/dashboard" className="inline-flex items-center gap-2">
                    Create your agent
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </GlassButton>
                <GlassButton
                  size="lg"
                  className="text-white/85"
                  onClick={() => setPlaying((p) => !p)}
                  aria-pressed={playing}
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playing ? "Pause demo call" : "Hear a demo call"}
                </GlassButton>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <ul className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2.5">
                {META.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-2 text-[12.5px] font-medium text-white/50">
                    <Icon className="h-3.5 w-3.5 text-cyan-300/80" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* live call stage — colourful content behind the glass */}
          <Reveal delay={0.1} y={34}>
            <div
              ref={stageRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setPointerInside(false)}
              className="relative mx-auto w-full max-w-[520px] pb-8 lg:max-w-none"
            >
              {/* refraction bed */}
              <div
                aria-hidden="true"
                className="absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_30%_20%,rgba(47,91,255,0.55),transparent_70%),radial-gradient(55%_55%_at_78%_65%,rgba(124,58,237,0.55),transparent_72%),radial-gradient(45%_45%_at_55%_95%,rgba(34,211,238,0.4),transparent_70%)] blur-[38px]"
              />
              <HeroCallCard playing={playing} onToggle={() => setPlaying((p) => !p)} />

              {/* cursor-following glass pill (desktop only) */}
              <motion.div
                aria-hidden="true"
                style={{ x: springX, y: springY }}
                animate={{ opacity: pointerInside && !reduceMotion ? 1 : 0, scale: pointerInside ? 1 : 0.9 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-none absolute left-0 top-0 hidden lg:block"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/[0.14] px-3.5 py-2 text-[11.5px] font-medium text-white shadow-[0_14px_30px_-16px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl">
                  <ArrowUpRight className="h-3 w-3 text-cyan-200" />
                  This is Aria talking
                </span>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}