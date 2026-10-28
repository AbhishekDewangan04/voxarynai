import React from "react";

/**
 * The colourful, always-moving backdrop every glass surface refracts.
 * Fixed so it drifts behind the whole page as the visitor scrolls.
 */
export default function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05060f]">
      {/* base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#0b1230_0%,#070a18_45%,#05060f_100%)]" />

      {/* drifting orbs */}
      <div className="absolute -left-[18%] top-[-14%] h-[58vw] w-[58vw] min-h-[420px] min-w-[420px] animate-orb-drift rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(47,91,255,0.85),rgba(47,91,255,0.16)_45%,transparent_68%)] blur-[80px] opacity-70" />
      <div className="absolute right-[-16%] top-[6%] h-[52vw] w-[52vw] min-h-[380px] min-w-[380px] animate-orb-drift-alt rounded-full bg-[radial-gradient(circle_at_60%_40%,rgba(124,58,237,0.85),rgba(124,58,237,0.18)_48%,transparent_70%)] blur-[90px] opacity-70" />
      <div className="absolute left-[24%] top-[42%] h-[40vw] w-[40vw] min-h-[300px] min-w-[300px] animate-orb-drift rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.55),rgba(34,211,238,0.1)_50%,transparent_72%)] blur-[100px] opacity-60 [animation-delay:-9s]" />
      <div className="absolute right-[6%] bottom-[6%] h-[36vw] w-[36vw] min-h-[280px] min-w-[280px] animate-orb-drift-alt rounded-full bg-[radial-gradient(circle,rgba(232,121,249,0.5),rgba(232,121,249,0.08)_52%,transparent_74%)] blur-[110px] opacity-55 [animation-delay:-16s]" />

      {/* refraction texture: fine grid that warps under the glass */}
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.35)_1px,transparent_1px)] [background-size:78px_78px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_78%)]" />

      {/* grain */}
      <div className="grain-overlay absolute inset-0 opacity-[0.22] mix-blend-soft-light" />

      {/* vignette so text always has contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_35%,rgba(3,4,10,0.55)_100%)]" />
    </div>
  );
}