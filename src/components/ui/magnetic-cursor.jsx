import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { vec2 } from "vecteur";

export function MagneticCursor({
  children,
  lerpAmount = 0.1,
  magneticFactor = 0.2,
  hoverPadding = 12,
  hoverAttribute = "data-magnetic",
  cursorSize = 24,
  cursorColor = "white", // Pure white works best for exclusion/difference
  blendMode = "exclusion", // Exclusion is safer than difference for text
  cursorClassName = "",
  shape = "circle",
  disableOnTouch = true,
  speedMultiplier = 0.02,
  maxScaleX = 1,
  maxScaleY = 0.3,
  contrastBoost = 1.5,
}) {
  const cursorRef = useRef(null);
  const cursorStateRef = useRef(null);
  const [disabled, setDisabled] = useState(false);
  const rafRef = useRef(null);
  const activeMagneticRef = useRef({
    el: null,
    xTo: null,
    yTo: null,
  });

  const configRef = useRef({
    magneticFactor,
    speedMultiplier,
    maxScaleX,
    maxScaleY,
    cursorSize,
    lerpAmount,
    hoverPadding,
  });

  useEffect(() => {
    configRef.current = {
      magneticFactor,
      speedMultiplier,
      maxScaleX,
      maxScaleY,
      cursorSize,
      lerpAmount,
      hoverPadding,
    };
  }, [magneticFactor, speedMultiplier, maxScaleX, maxScaleY, cursorSize, lerpAmount, hoverPadding]);

  // Check touch devices and prefers-reduced-motion
  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const checkDisabled = () => {
      const reducedMotion = mediaQuery.matches;
      setDisabled((disableOnTouch && isTouch) || reducedMotion);
    };

    checkDisabled();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", checkDisabled);
      return () => mediaQuery.removeEventListener("change", checkDisabled);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(checkDisabled);
      return () => mediaQuery.removeListener(checkDisabled);
    }
  }, [disableOnTouch]);

  useEffect(() => {
    if (disabled) return;
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    gsap.set(cursorEl, { xPercent: -50, yPercent: -50 });

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const detachDuration = prefersReducedMotion ? 0.1 : 0.35;

    if (!cursorStateRef.current) {
      cursorStateRef.current = {
        el: cursorEl,
        pos: {
          current: vec2(-100, -100),
          target: vec2(-100, -100),
          previous: vec2(-100, -100),
        },
        hover: { isHovered: false },
        isDetaching: false,
      };
    }

    const update = () => {
      const state = cursorStateRef.current;
      if (!state || state.hover.isHovered) return;

      const { speedMultiplier: sm, maxScaleX: mx, maxScaleY: my, lerpAmount: la } = configRef.current;
      const effectiveLerp = prefersReducedMotion ? 1 : la;

      state.pos.current.lerp(state.pos.target, effectiveLerp);
      const delta = state.pos.current.clone().sub(state.pos.previous);
      state.pos.previous.copy(state.pos.current);

      if (state.isDetaching) {
        gsap.set(state.el, {
          x: state.pos.current.x,
          y: state.pos.current.y,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          overwrite: "auto",
        });
      } else {
        const speed = Math.sqrt(delta.x * delta.x + delta.y * delta.y) * sm;
        gsap.set(state.el, {
          x: state.pos.current.x,
          y: state.pos.current.y,
          rotate: Math.atan2(delta.y, delta.x) * (180 / Math.PI),
          scaleX: 1 + Math.min(speed, mx),
          scaleY: 1 - Math.min(speed, my),
          overwrite: "auto",
        });
      }
    };

    const initializePosition = (event) => {
      const state = cursorStateRef.current;
      if (!state) return;
      const x = event.clientX;
      const y = event.clientY;
      state.pos.current.x = x;
      state.pos.current.y = y;
      state.pos.target.x = x;
      state.pos.target.y = y;
      state.pos.previous.x = x;
      state.pos.previous.y = y;
      gsap.set(cursorEl, { x, y, opacity: 1 });
    };

    const releaseActiveMagnetic = () => {
      const activeEl = activeMagneticRef.current.el;
      if (activeEl) {
        if (activeMagneticRef.current.xTo && activeMagneticRef.current.yTo) {
          activeMagneticRef.current.xTo(0);
          activeMagneticRef.current.yTo(0);
        } else {
          gsap.to(activeEl, { x: 0, y: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
        }
        activeMagneticRef.current.el = null;
        activeMagneticRef.current.xTo = null;
        activeMagneticRef.current.yTo = null;
      }

      const state = cursorStateRef.current;
      if (!state) return;
      const currentX = gsap.getProperty(cursorEl, "x");
      const currentY = gsap.getProperty(cursorEl, "y");
      state.pos.current.x = currentX;
      state.pos.current.y = currentY;
      state.pos.previous.x = currentX;
      state.pos.previous.y = currentY;

      state.hover.isHovered = false;
      state.isDetaching = true;

      const { cursorSize: cs } = configRef.current;
      const shapeBorderRadius = shape === "circle" ? "50%" : shape === "square" ? "0" : "8px";

      gsap.killTweensOf(cursorEl);
      gsap.to(cursorEl, {
        width: cs,
        height: cs,
        borderRadius: shapeBorderRadius,
        backgroundColor: cursorColor,
        scaleX: 1,
        scaleY: 1,
        duration: detachDuration,
        ease: "power3.out",
        overwrite: "all",
        onComplete: () => {
          if (state) state.isDetaching = false;
        },
      });
    };

    const onPointerMove = (event) => {
      const state = cursorStateRef.current;
      if (!state) return;

      const target = event.target;
      if (!target) return;

      // Never apply cursor to inputs, textareas, selects
      const isInput = target.closest("input, textarea, select");
      if (isInput) {
        gsap.to(cursorEl, { opacity: 0, duration: 0.15, overwrite: "auto" });
        if (activeMagneticRef.current.el) {
          releaseActiveMagnetic();
        }
        return;
      }

      state.pos.target.x = event.clientX;
      state.pos.target.y = event.clientY;

      const isInViewport =
        event.clientX >= 0 &&
        event.clientX <= window.innerWidth &&
        event.clientY >= 0 &&
        event.clientY <= window.innerHeight;

      gsap.to(cursorEl, { opacity: isInViewport ? 1 : 0, duration: 0.2, overwrite: "auto" });

      // Event delegation for magnetic targets
      const magneticEl = target.closest(`[${hoverAttribute}]`);

      if (magneticEl) {
        if (magneticEl !== activeMagneticRef.current.el) {
          if (activeMagneticRef.current.el) {
            releaseActiveMagnetic();
          }
          activeMagneticRef.current.el = magneticEl;
          activeMagneticRef.current.xTo = gsap.quickTo(magneticEl, "x", {
            duration: 0.8,
            ease: "power2.out",
          });
          activeMagneticRef.current.yTo = gsap.quickTo(magneticEl, "y", {
            duration: 0.8,
            ease: "power2.out",
          });

          state.hover.isHovered = true;
          state.isDetaching = false;

          const bounds = magneticEl.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(magneticEl);
          const magneticColor = magneticEl.getAttribute("data-magnetic-color") || cursorColor;
          const { magneticFactor: mf, hoverPadding: hp } = configRef.current;
          const dynamicPadding = hp * (1 + mf);
          const currentTx = gsap.getProperty(magneticEl, "x") || 0;
          const currentTy = gsap.getProperty(magneticEl, "y") || 0;
          const centerX = bounds.left - currentTx + bounds.width / 2;
          const centerY = bounds.top - currentTy + bounds.height / 2;

          gsap.killTweensOf(cursorEl);
          gsap.to(cursorEl, {
            x: centerX,
            y: centerY,
            width: bounds.width + dynamicPadding * 2,
            height: bounds.height + dynamicPadding * 2,
            borderRadius: computedStyle.borderRadius || "16px",
            backgroundColor: magneticColor,
            scaleX: 1,
            scaleY: 1,
            rotate: 0,
            opacity: 1,
            duration: 0.3,
            ease: "power3.out",
            overwrite: "all",
          });
        }

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const el = activeMagneticRef.current.el;
          if (el) {
            const bounds = el.getBoundingClientRect();
            const currentTx = gsap.getProperty(el, "x") || 0;
            const currentTy = gsap.getProperty(el, "y") || 0;
            const originCenterX = bounds.left - currentTx + bounds.width / 2;
            const originCenterY = bounds.top - currentTy + bounds.height / 2;
            const { magneticFactor: mf } = configRef.current;
            const pullX = (event.clientX - originCenterX) * mf;
            const pullY = (event.clientY - originCenterY) * mf;
            if (activeMagneticRef.current.xTo) activeMagneticRef.current.xTo(pullX);
            if (activeMagneticRef.current.yTo) activeMagneticRef.current.yTo(pullY);

            gsap.to(cursorEl, {
              x: originCenterX + pullX * 0.45,
              y: originCenterY + pullY * 0.45,
              duration: 0.15,
              ease: "power1.out",
              overwrite: "auto",
            });
          }
          rafRef.current = null;
        });
      } else {
        if (activeMagneticRef.current.el) {
          releaseActiveMagnetic();
        }

        const isTextContent =
          ["P", "SPAN", "H1", "H2", "H3", "H4", "H5", "H6"].includes(target.tagName) ||
          window.getComputedStyle(target).cursor === "text";

        if (isTextContent && !state.hover.isHovered && !state.isDetaching) {
          gsap.to(cursorEl, { scaleX: 0.5, scaleY: 1.5, duration: 0.3, overwrite: "auto" });
        }
      }
    };

    const handleMouseLeave = () => {
      if (activeMagneticRef.current.el) {
        releaseActiveMagnetic();
      }
      gsap.to(cursorEl, { opacity: 0, duration: 0.3 });
    };

    const handleMouseEnter = () => gsap.to(cursorEl, { opacity: 1, duration: 0.3 });

    gsap.ticker.add(update);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointermove", initializePosition, { once: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gsap.ticker.remove(update);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointermove", initializePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (activeMagneticRef.current.el) {
        releaseActiveMagnetic();
      }
    };
  }, [disabled, hoverAttribute, cursorColor, shape]);

  if (disabled) {
    return <>{children}</>;
  }

  const styles = {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
    pointerEvents: "none",
    willChange: "transform, width, height, border-radius",
    backgroundColor: cursorColor,
    mixBlendMode: blendMode,
    width: cursorSize,
    height: cursorSize,
    borderRadius: shape === "circle" ? "50%" : shape === "square" ? "0" : "8px",
    backdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : "none",
    WebkitBackdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : "none",
  };

  return (
    <>
      <div ref={cursorRef} className={`magnetic-cursor ${cursorClassName}`} style={styles} />
      {children}
    </>
  );
}

export default MagneticCursor;
