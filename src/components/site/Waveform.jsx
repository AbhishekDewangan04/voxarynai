import React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight CSS waveform. Bars scale on the Y axis only, so it stays on the
 * compositor and never triggers layout.
 */
export default function Waveform({ bars = 44, active = true, className, tone = "default" }) {
  const heights = React.useMemo(
    () =>
      Array.from({ length: bars }, (_, i) => {
        const wave = Math.abs(Math.sin(i * 0.73) * 0.6 + Math.sin(i * 0.21) * 0.4);
        return 22 + wave * 78;
      }),
    [bars]
  );

  const palette =
    tone === "soft"
      ? "from-cyan-300/50 via-sky-300/70 to-violet-300/50"
      : "from-cyan-400/80 via-sky-400 to-violet-300/90";

  return (
    <div className={cn("flex h-full w-full items-center justify-center gap-[3px]", className)} aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] shrink-0 origin-center rounded-full bg-gradient-to-t transition-opacity duration-500", palette, active ? "animate-wave" : "opacity-40")}
          style={{
            height: `${h}%`,
            animationDelay: `${(i % 11) * 0.085}s`,
            animationDuration: `${1.15 + (i % 6) * 0.13}s`,
          }}
        />
      ))}
    </div>
  );
}