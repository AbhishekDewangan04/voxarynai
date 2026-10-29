import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function WaveMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none" strokeLinecap="round" strokeWidth="2.4">
      <defs>
        <linearGradient id="voxaryn-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.55" stopColor="#2f5bff" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <g stroke="url(#voxaryn-mark)">
        <path d="M5 14v4" />
        <path d="M10 10v12" />
        <path d="M16 6v20" />
        <path d="M22 10v12" />
        <path d="M27 14v4" />
      </g>
    </svg>
  );
}

export default function Brand({ className, withAi = true }) {
  return (
    <Link
      to="/"
      className={cn(
        "cursor-target group inline-flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060f]",
        className
      )}
      aria-label="Voxaryn AI — home"
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-2xl border border-white/20 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-10px_rgba(47,91,255,0.9)] backdrop-blur-md">
        <WaveMark className="h-5 w-5" />
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 to-transparent opacity-40" />
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">
        Voxaryn{withAi && <span className="ml-1 font-normal text-white/45">AI</span>}
      </span>
    </Link>
  );
}