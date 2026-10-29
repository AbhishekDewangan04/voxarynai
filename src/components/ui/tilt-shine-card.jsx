import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TiltShineCard({
  children,
  className,
  maxTilt = 9,
  glare = true,
  ...props
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const touch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    setIsTouch(touch);
  }, []);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.6 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Rotate towards cursor
  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt]);

  // Shifting soft shadow
  const shadowX = useTransform(smoothX, [0, 1], [-12, 12]);
  const shadowY = useTransform(smoothY, [0, 1], [-12, 12]);
  const boxShadow = useTransform(
    [shadowX, shadowY],
    ([sx, sy]) =>
      isHovered
        ? `${sx}px ${sy}px 36px -8px rgba(47, 91, 255, 0.32), 0 24px 44px -16px rgba(0, 0, 0, 0.7)`
        : `0 12px 30px -12px rgba(0, 0, 0, 0.5)`
  );

  // Moving glare highlight
  const glarePercentX = useTransform(smoothX, (val) => `${val * 100}%`);
  const glarePercentY = useTransform(smoothY, (val) => `${val * 100}%`);
  const glareBackground = useTransform(
    [glarePercentX, glarePercentY],
    ([gx, gy]) =>
      `radial-gradient(circle 320px at ${gx} ${gy}, rgba(255, 255, 255, 0.16), transparent 70%)`
  );

  const handlePointerMove = (e) => {
    if (isTouch || reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const clientX = (e.clientX - rect.left) / rect.width;
    const clientY = (e.clientY - rect.top) / rect.height;
    x.set(Math.max(0, Math.min(1, clientX)));
    y.set(Math.max(0, Math.min(1, clientY)));
  };

  const handlePointerEnter = () => {
    if (isTouch || reducedMotion) return;
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  const shouldDisable = isTouch || reducedMotion;

  return (
    <div
      style={{ perspective: 1100 }}
      className={cn("h-full w-full", className)}
    >
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX: shouldDisable ? 0 : rotateX,
          rotateY: shouldDisable ? 0 : rotateY,
          transformStyle: "preserve-3d",
          boxShadow: shouldDisable ? undefined : boxShadow,
        }}
        className="relative h-full w-full rounded-3xl"
        {...props}
      >
        {children}

        {/* Moving glare/shine overlay */}
        {glare && !shouldDisable && isHovered && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="absolute -inset-[50%] pointer-events-none"
              style={{ background: glareBackground }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default TiltShineCard;
