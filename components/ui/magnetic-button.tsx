"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MagneticButton({
  children,
  className,
  onClick,
  href,
  strength = 0.35,
  fullWidth = false,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  strength?: number;
  fullWidth?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const Comp = href ? "a" : "button";

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={fullWidth ? "block w-full" : "inline-block"}
    >
      <Comp
        href={href}
        onClick={onClick}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[14px] px-7 py-3.5 text-[15px] font-medium tracking-tight transition-colors",
          fullWidth && "w-full",
          className
        )}
      >
        {children}
      </Comp>
    </motion.div>
  );
}
