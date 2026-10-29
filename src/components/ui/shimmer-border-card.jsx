import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ShimmerBorderCard({
  icon: Icon,
  title,
  description,
  children,
  className,
  shimmerDuration = 5,
  ...props
}) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: "50px" });
  const reducedMotion = useReducedMotion();

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative isolate h-full w-full rounded-2xl p-[1px] overflow-hidden border border-white/10 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]",
        className
      )}
      {...props}
    >
      {/* Animated shimmer beam traveling continuously around the border */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[150%] z-0 [background:conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_280deg,rgba(56,189,248,0.25)_315deg,rgba(255,255,255,0.85)_345deg,rgba(129,140,248,0.5)_355deg,transparent_360deg)]"
        animate={reducedMotion || !isInView ? undefined : { rotate: 360 }}
        transition={{
          duration: shimmerDuration,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Inner card surface */}
      {children ? (
        <div className="relative z-10 h-full w-full rounded-[calc(1rem-1px)]">
          {children}
        </div>
      ) : (
        <div className="relative z-10 flex h-full w-full flex-col justify-between rounded-[calc(1rem-1px)] bg-[#070b19]/90 p-6 sm:p-7 backdrop-blur-xl">
          <div>
            {Icon && (
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/[0.07] text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            {title && (
              <h3 className="mt-5 font-display text-[18px] font-semibold tracking-[-0.01em] text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">
                {description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShimmerBorderCard;
