import React from "react";

export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/40">{eyebrow}</p>
        )}
        <h1 className="font-display-tight mt-1.5 text-[clamp(1.55rem,3vw,2.1rem)] text-white">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-white/50">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}