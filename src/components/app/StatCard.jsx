import React from "react";
import { GlassCard } from "@/components/site/Glass";

export default function StatCard({ label, value, hint, loading = false }) {
  return (
    <GlassCard className="p-4">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/40">{label}</p>
      {loading ? (
        <div className="mt-2 h-7 w-20 animate-pulse rounded-full bg-white/[0.07]" />
      ) : (
        <p className="font-display mt-1.5 text-[22px] font-bold tracking-[-0.03em] text-white">{value}</p>
      )}
      <p className="mt-0.5 text-[11px] text-cyan-200/75">{hint}</p>
    </GlassCard>
  );
}