import React, { forwardRef, useId, useMemo } from "react";
import { cva } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Apple "Tahoe" liquid glass primitives.
 *
 * Refraction is produced with an SVG feDisplacementMap applied through
 * backdrop-filter, so the backdrop itself is bent at the rim of the surface.
 * That only runs in Chromium browsers; Safari / Firefox fall back to a plain
 * frosted blur (expected, not a bug).
 */

const supportsRefraction =
  typeof window !== "undefined" &&
  typeof document !== "undefined" &&
  /Chrome\/|Chromium|Edg\//.test(window.navigator.userAgent) &&
  !/CriOS|FxiOS|OPiOS|EdgiOS/.test(window.navigator.userAgent);

let cachedEdgeMap = null;

/** Radial edge-vector field: neutral (128,128) in the middle, bending outward at the rim. */
function buildEdgeMap(size = 192) {
  if (cachedEdgeMap) return cachedEdgeMap;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const image = ctx.createImageData(size, size);
  const data = image.data;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = ((x + 0.5) / size) * 2 - 1;
      const ny = ((y + 0.5) / size) * 2 - 1;
      const square = Math.max(Math.abs(nx), Math.abs(ny));
      const ramp = Math.max(0, Math.min(1, (square - 0.66) / 0.34));
      const ease = ramp * ramp * (3 - 2 * ramp);
      const len = Math.hypot(nx, ny) || 1;
      const i = (y * size + x) * 4;
      data[i] = Math.round(128 + (nx / len) * ease * 127);
      data[i + 1] = Math.round(128 + (ny / len) * ease * 127);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  cachedEdgeMap = canvas.toDataURL("image/png");
  return cachedEdgeMap;
}

function useLiquidGlass({ refraction, blur, saturation }) {
  const rawId = useId();
  const filterId = `liquid-glass-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const edgeMap = useMemo(
    () => (supportsRefraction && refraction > 0 ? buildEdgeMap() : null),
    [refraction]
  );

  const backdropFilter = edgeMap
    ? `url(#${filterId}) blur(${blur}px) saturate(${saturation})`
    : `blur(${Math.max(blur + 12, 14)}px) saturate(${saturation})`;

  const Defs = edgeMap ? (
    <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden">
      <defs>
        <filter
          id={filterId}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={edgeMap}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="edgeMap"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="edgeMap"
            scale={refraction}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  ) : null;

  return { backdropFilter, Defs };
}

const materials = {
  clear: {
    dark: { backgroundColor: "rgba(255,255,255,0.045)", borderColor: "rgba(255,255,255,0.20)" },
    light: { backgroundColor: "rgba(255,255,255,0.42)", borderColor: "rgba(255,255,255,0.65)" },
  },
  regular: {
    dark: { backgroundColor: "rgba(255,255,255,0.075)", borderColor: "rgba(255,255,255,0.14)" },
    light: { backgroundColor: "rgba(255,255,255,0.66)", borderColor: "rgba(255,255,255,0.75)" },
  },
  thick: {
    dark: { backgroundColor: "rgba(8,11,26,0.62)", borderColor: "rgba(255,255,255,0.10)" },
    light: { backgroundColor: "rgba(255,255,255,0.82)", borderColor: "rgba(255,255,255,0.85)" },
  },
};

const sheen = {
  dark:
    "linear-gradient(148deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.045) 26%, rgba(255,255,255,0) 52%, rgba(255,255,255,0.055) 100%)",
  light:
    "linear-gradient(148deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.35) 34%, rgba(255,255,255,0.14) 68%, rgba(255,255,255,0.5) 100%)",
};

const accentWash =
  "linear-gradient(132deg, rgba(124,58,237,0.6) 0%, rgba(47,91,255,0.5) 48%, rgba(34,211,238,0.45) 100%)";

function glassSurface({ material, appearance, bezel, backdropFilter, accent = false }) {
  const tone = materials[material]?.[appearance] ?? materials.regular.dark;
  const baseSheen = sheen[appearance] ?? sheen.dark;
  return {
    backdropFilter,
    WebkitBackdropFilter: backdropFilter,
    backgroundColor: tone.backgroundColor,
    border: `1px solid ${tone.borderColor}`,
    backgroundImage: accent ? `${accentWash}, ${baseSheen}` : baseSheen,
    boxShadow: [
      `inset 0 1px 0 0 rgba(255,255,255,${appearance === "dark" ? 0.26 : 0.9})`,
      `inset 0 -1px 0 0 rgba(255,255,255,${appearance === "dark" ? 0.08 : 0.35})`,
      `inset 0 0 ${Math.round(bezel)}px rgba(255,255,255,${appearance === "dark" ? 0.05 : 0.3})`,
      "0 28px 60px -32px rgba(2,4,14,0.9)",
    ].join(", "),
  };
}

export const LiquidGlass = forwardRef(function LiquidGlass(
  {
    children,
    className,
    material = "regular",
    appearance = "dark",
    refraction = 24,
    bezel = 28,
    blur = 2,
    saturation = 1.4,
    interactive = false,
    className: extraClassName,
    ...props
  },
  ref
) {
  const reduceMotion = useReducedMotion();
  const { backdropFilter, Defs } = useLiquidGlass({ refraction, blur, saturation });

  return (
    <motion.div
      ref={ref}
      className={cn("relative isolate overflow-hidden text-white", interactive && "cursor-pointer", className)}
      style={glassSurface({ material, appearance, bezel, backdropFilter })}
      whileHover={
        interactive && !reduceMotion
          ? { y: -3, boxShadow: "0 34px 70px -30px rgba(47,91,255,0.45)" }
          : undefined
      }
      whileTap={interactive && !reduceMotion ? { scale: 0.992 } : undefined}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      {...props}
    >
      {Defs}
      {children}
    </motion.div>
  );
});

const buttonStyles = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium leading-none text-white transition-[filter,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060f] disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      size: {
        sm: "h-9 rounded-full px-4 text-[13px]",
        md: "h-11 rounded-full px-5 text-sm",
        lg: "h-14 rounded-full px-7 text-[15px]",
        icon: "h-10 w-10 rounded-full",
      },
      tone: {
        default: "[text-shadow:0_1px_12px_rgba(0,0,0,0.35)]",
        primary: "[text-shadow:0_1px_14px_rgba(0,0,0,0.45)]",
        quiet: "text-white/80",
      },
    },
    defaultVariants: { size: "md", tone: "default" },
  }
);

export const LiquidGlassButton = forwardRef(function LiquidGlassButton(
  {
    children,
    className,
    size = "md",
    tone = "default",
    material = "clear",
    appearance = "dark",
    refraction = 26,
    bezel = 22,
    blur = 2,
    saturation = 1.5,
    interactive = true,
    type = "button",
    ...props
  },
  ref
) {
  const reduceMotion = useReducedMotion();
  const { backdropFilter, Defs } = useLiquidGlass({ refraction, blur, saturation });

  return (
    <motion.button
      ref={ref}
      type={type}
      className={cn(buttonStyles({ size, tone }), className)}
      style={glassSurface({ material, appearance, bezel, backdropFilter, accent: tone === "primary" })}
      whileHover={
        interactive && !reduceMotion
          ? { scale: 1.035, boxShadow: "0 20px 45px -18px rgba(124,58,237,0.65)" }
          : undefined
      }
      whileTap={interactive && !reduceMotion ? { scale: 0.965 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      {...props}
    >
      {Defs}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
});

export default LiquidGlass;