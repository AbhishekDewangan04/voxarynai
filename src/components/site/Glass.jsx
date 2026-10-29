import React from "react";
import { cn } from "@/lib/utils";
import { LiquidGlass, LiquidGlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button";

/** Large refractive panel — hero card, dashboard shell, final CTA. */
export function GlassPanel({ className, children, refraction = 0, ...props }) {
  return (
    <LiquidGlass
      material="clear"
      appearance="dark"
      refraction={refraction}
      bezel={30}
      blur={2}
      saturation={1.45}
      className={cn("rounded-[2rem]", className)}
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}

/** Repeated / text-heavy card — features, pricing, FAQ: keeps text crisp. */
export function GlassCard({ className, children, refraction = 0, ...props }) {
  return (
    <LiquidGlass
      material="regular"
      appearance="dark"
      refraction={refraction}
      bezel={20}
      blur={2}
      saturation={1.35}
      className={cn("rounded-3xl", className)}
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}

/** Small inline surface — chips, badges, toggles. */
export function GlassChip({ className, children, refraction = 0, ...props }) {
  return (
    <LiquidGlass
      material="regular"
      appearance="dark"
      refraction={refraction}
      bezel={10}
      blur={1}
      saturation={1.3}
      className={cn("rounded-full", className)}
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}

export function GlassButton({ className, children, ...props }) {
  return (
    <LiquidGlassButton className={cn("cursor-target", className)} {...props}>
      {children}
    </LiquidGlassButton>
  );
}

export { LiquidGlass, LiquidGlassButton };