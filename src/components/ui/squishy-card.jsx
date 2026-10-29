import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SquishyCard({
  badge = "Most Popular",
  price = "$79",
  period = "/ month",
  description = "For people whose phone is part of the job.",
  buttonText = "Choose Pro",
  onButtonClick,
  children,
  className,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const reducedMotion = useReducedMotion();

  const springTransition = {
    type: "spring",
    stiffness: 260,
    damping: 18,
    mass: 0.6,
  };

  const getBlobState = () => {
    if (reducedMotion) return "idle";
    if (isPressed) return "pressed";
    if (isHovered) return "hover";
    return "idle";
  };

  const blobState = getBlobState();

  return (
    <div
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      className={cn(
        "group relative isolate h-full w-full rounded-3xl p-[1.5px] bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-[0_30px_90px_-25px_rgba(124,58,237,0.75)] transition-shadow duration-500 hover:shadow-[0_40px_100px_-20px_rgba(124,58,237,0.95)]",
        className
      )}
      {...props}
    >
      {/* Inner surface containing the squishy blobs */}
      <div className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-[#07091c]/92">
        {/* Large dark rounded blob shapes that squash and stretch with spring physics */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {/* Blob 1 — Top Right Deep Indigo */}
          <motion.div
            className="absolute -right-12 -top-12 h-64 w-64 bg-[#141846]/95 blur-xl"
            animate={blobState}
            variants={{
              idle: {
                scaleX: 1,
                scaleY: 1,
                borderRadius: "55% 45% 65% 35% / 45% 55% 45% 55%",
              },
              hover: {
                scaleX: 1.25,
                scaleY: 0.85,
                borderRadius: "35% 65% 40% 60% / 60% 35% 65% 40%",
              },
              pressed: {
                scaleX: 0.88,
                scaleY: 1.28,
                borderRadius: "65% 35% 60% 40% / 35% 65% 40% 60%",
              },
            }}
            transition={springTransition}
          />

          {/* Blob 2 — Bottom Left Midnight Cyan */}
          <motion.div
            className="absolute -bottom-16 -left-16 h-72 w-72 bg-[#0a1f3d]/90 blur-xl"
            animate={blobState}
            variants={{
              idle: {
                scaleX: 1,
                scaleY: 1,
                borderRadius: "45% 55% 35% 65% / 55% 45% 60% 40%",
              },
              hover: {
                scaleX: 0.86,
                scaleY: 1.24,
                borderRadius: "65% 35% 60% 40% / 40% 60% 35% 65%",
              },
              pressed: {
                scaleX: 1.26,
                scaleY: 0.84,
                borderRadius: "35% 65% 45% 55% / 60% 40% 65% 35%",
              },
            }}
            transition={springTransition}
          />

          {/* Blob 3 — Center Deep Violet */}
          <motion.div
            className="absolute left-1/4 top-1/3 h-56 w-56 bg-[#1a0f3d]/85 blur-2xl"
            animate={blobState}
            variants={{
              idle: {
                scaleX: 1,
                scaleY: 1,
                borderRadius: "50% 50% 50% 50% / 50% 50% 50% 50%",
              },
              hover: {
                scaleX: 1.15,
                scaleY: 0.9,
                borderRadius: "40% 60% 35% 65% / 55% 45% 50% 50%",
              },
              pressed: {
                scaleX: 0.92,
                scaleY: 1.18,
                borderRadius: "60% 40% 65% 35% / 45% 55% 50% 50%",
              },
            }}
            transition={springTransition}
          />

          {/* Subtle accent light wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-violet-500/[0.05]" />
        </div>

        {/* Content layer — text stays 100% sharp and readable above blobs */}
        <div className="relative z-10 flex h-full w-full flex-col">
          {children ? (
            children
          ) : (
            <div className="flex h-full flex-col justify-between p-6 sm:p-7">
              <div>
                {badge && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-gradient-to-r from-violet-500 to-blue-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-lg">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {badge}
                  </span>
                )}
                <div className="mt-5 flex items-end gap-1.5">
                  <span className="font-display-tight text-5xl text-white">{price}</span>
                  {period && <span className="pb-1.5 text-[12px] text-white/45">{period}</span>}
                </div>
                {description && (
                  <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">
                    {description}
                  </p>
                )}
              </div>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={onButtonClick}
                  className="cursor-target w-full rounded-2xl border border-white/25 bg-white/[0.14] py-3 text-center text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/25"
                >
                  {buttonText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SquishyCard;
