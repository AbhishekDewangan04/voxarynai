import React from "react";

export function SkeletonLine({ width = "100%", height = 14 }) {
  return <div className="animate-pulse rounded-full bg-white/[0.07]" style={{ width, height }} />;
}

export function SkeletonRows({ rows = 4, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <SkeletonLine width="38%" height={12} />
          <div className="mt-3 space-y-2">
            <SkeletonLine width="82%" height={10} />
            <SkeletonLine width="62%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <SkeletonLine width="45%" height={12} />
          <div className="mt-3 space-y-2">
            <SkeletonLine width="90%" height={10} />
            <SkeletonLine width="70%" height={10} />
            <SkeletonLine width="55%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}