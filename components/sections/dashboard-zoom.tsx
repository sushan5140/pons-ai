"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Bell, Calendar, FileText, Search } from "lucide-react";

export default function DashboardZoom() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [0.72, 1.05, 1.7]);
  const panelOpacity = useTransform(scrollYProgress, [0, 0.15, 0.75, 1], [0, 1, 1, 0]);
  const vignette = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.2, 0.5], [1, 1, 0]);
  const labelY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);

  return (
    <section ref={sectionRef} className="relative h-[220vh] bg-ink">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-texture opacity-[0.08]" />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-secondary/25 blur-[160px]" />

        <motion.div
          style={{ opacity: labelOpacity, y: labelY }}
          className="absolute top-28 z-20 text-center"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/40">
            Step inside
          </p>
          <h2 className="mt-3 font-display text-[40px] font-bold tracking-tight text-white sm:text-[56px]">
            One dashboard. Everything inside.
          </h2>
        </motion.div>

        <motion.div
          style={{ scale, opacity: panelOpacity }}
          className="relative z-10 w-[min(880px,88vw)] rounded-[22px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_60px_140px_-40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 pb-3 pt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="ml-3 text-[12px] text-white/40">Aura — Parent Dashboard</span>
          </div>
          <div className="grid grid-cols-4 gap-3 p-4">
            {[
              { icon: Search, label: "Universal Search" },
              { icon: FileText, label: "Documents" },
              { icon: Calendar, label: "Calendar" },
              { icon: Bell, label: "Notifications" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col gap-3 rounded-[16px] border border-white/10 bg-white/[0.03] p-4"
              >
                <Icon className="h-4 w-4 text-accent" />
                <span className="text-[12px] text-white/60">{label}</span>
                <div className="mt-auto h-1.5 w-2/3 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: vignette }}
          className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.9)_100%)]"
        />
      </div>
    </section>
  );
}
