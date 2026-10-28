import React from "react";

const BASE_INPUT =
  "w-full rounded-2xl border border-white/12 bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15";

export function TextField({ label, hint, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/40">
        {label}
      </span>
      <input {...props} className={`${BASE_INPUT} ${className}`} />
      {hint && <span className="mt-1 block text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, hint, rows = 3, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/40">
        {label}
      </span>
      <textarea rows={rows} {...props} className={`${BASE_INPUT} resize-none leading-relaxed ${className}`} />
      {hint && <span className="mt-1 block text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

export function SelectField({ label, className = "", children, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/40">
        {label}
      </span>
      <select {...props} className={`${BASE_INPUT} appearance-none ${className}`}>
        {children}
      </select>
    </label>
  );
}