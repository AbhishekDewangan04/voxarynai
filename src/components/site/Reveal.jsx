import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Scroll-reveal wrapper. Silently becomes a plain element when the visitor
 * prefers reduced motion.
 */
export default function Reveal({ children, className, delay = 0, y = 26, once = true }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-70px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}