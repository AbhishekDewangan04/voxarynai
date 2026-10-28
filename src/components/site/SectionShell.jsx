import React from "react";
import Reveal from "./Reveal";
import { cn } from "@/lib/utils";

export default function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  align = "center",
  className,
  contentClassName,
}) {
  const centered = align === "center";
  return (
    <section id={id} className={cn("relative py-20 sm:py-24 lg:py-28", className)}>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        {(eyebrow || title || description) && (
          <Reveal className={cn("max-w-2xl", centered && "mx-auto text-center")}>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="font-display-tight mt-5 text-balance text-[clamp(2rem,4.4vw,3.4rem)] text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-pretty text-[15.5px] leading-relaxed text-white/62 sm:text-base">
                {description}
              </p>
            )}
          </Reveal>
        )}
        <div className={contentClassName}>{children}</div>
      </div>
    </section>
  );
}