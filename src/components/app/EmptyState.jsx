import React from "react";

export default function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/35 to-cyan-400/25 text-white ring-1 ring-white/20">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <p className="mt-4 text-[15px] font-semibold text-white">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-white/45">{description}</p>}
      {children && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}