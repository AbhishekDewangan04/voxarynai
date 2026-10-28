import React from "react";

export default function Toggle({ checked, onChange, label, hint, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-white">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] leading-relaxed text-white/40">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-50 ${
          checked ? "bg-gradient-to-r from-violet-500 to-cyan-400" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}