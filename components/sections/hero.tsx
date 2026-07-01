"use client";

import dynamic from "next/dynamic";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import MagneticButton from "@/components/ui/magnetic-button";
import Reveal from "@/components/ui/reveal";
import AmbientBackground from "@/components/ui/ambient-background";
import { cn } from "@/lib/utils";
import { ChildCard, HomeworkCard, ExamReminderCard, PDFCard, NotificationChip } from "@/components/dashboard/cards";
import { ChatBubble } from "@/components/dashboard/chat-bubble";
import { CalendarMini } from "@/components/dashboard/calendar-mini";
import { SearchBar } from "@/components/dashboard/search-bar";

const AmbientOrbs = dynamic(() => import("@/components/three/ambient-orbs"), { ssr: false });

function FloatingLayer({
  mx,
  my,
  depth = 20,
  rotate = 0,
  delay = 0,
  duration = 5,
  className,
  children,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth?: number;
  rotate?: number;
  delay?: number;
  duration?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const translateX = useTransform(mx, [-0.5, 0.5], [-depth, depth]);
  const translateY = useTransform(my, [-0.5, 0.5], [-depth, depth]);
  const springX = useSpring(translateX, { stiffness: 180, damping: 16, mass: 0.4 });
  const springY = useSpring(translateY, { stiffness: 180, damping: 16, mass: 0.4 });

  return (
    <motion.div
      style={{ x: springX, y: springY, rotate }}
      className={cn("absolute drop-shadow-[0_30px_60px_rgba(30,31,38,0.14)]", className)}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.3 + delay * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <section
      id="product"
      className="relative flex min-h-screen items-center overflow-hidden px-6 pb-16 pt-36"
    >
      <AmbientBackground />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        {/* left */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-white/50 px-4 py-1.5 text-[13px] font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered School Assistant
            </span>
          </Reveal>

          <h1 className="mt-7 text-balance font-display text-[56px] font-bold leading-[0.98] tracking-[-0.02em] text-ink sm:text-[72px] lg:text-[84px]">
            <Reveal as="span" className="block overflow-hidden">
              Every School Update.
            </Reveal>
            <Reveal as="span" delay={0.1} className="block overflow-hidden bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
              One Intelligent Dashboard.
            </Reveal>
          </h1>

          <Reveal delay={0.25}>
            <p className="mt-7 max-w-md text-balance text-[18px] leading-relaxed text-ink/60 sm:text-[19px]">
              Homework, exams, circulars, PDFs, and reminders — organized automatically for
              every child, so nothing important ever slips through.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton className="bg-ink text-white shadow-[0_16px_32px_-12px_rgba(30,31,38,0.45)] hover:bg-primary">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <MagneticButton className="border border-hairline-strong bg-white/40 text-ink hover:bg-white/70" strength={0.25}>
                <Play className="h-3.5 w-3.5" />
                Watch Demo
              </MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={0.55}>
            <div className="mt-14 flex items-center gap-8 border-t border-hairline pt-8">
              <div>
                <p className="font-display text-[26px] font-bold text-ink">12k+</p>
                <p className="text-[13px] text-ink/45">Parents onboard</p>
              </div>
              <div className="h-8 w-px bg-hairline" />
              <div>
                <p className="font-display text-[26px] font-bold text-ink">340+</p>
                <p className="text-[13px] text-ink/45">Schools connected</p>
              </div>
              <div className="h-8 w-px bg-hairline" />
              <div>
                <p className="font-display text-[26px] font-bold text-ink">99.2%</p>
                <p className="text-[13px] text-ink/45">Nothing missed</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* right — floating application preview */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 1400 }}
          className="relative h-[680px] w-full"
        >
          <AmbientOrbs className="absolute inset-0 -z-10 scale-125 opacity-60" />

          <FloatingLayer mx={mx} my={my} depth={14} rotate={-3} duration={6} className="left-0 top-2 w-[270px]">
            <div className="glass-surface rounded-[22px] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-ink">Dashboard</p>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="mt-3 flex gap-2">
                <ChildCard name="Aarav" grade="Grade 6" initials="A" status="On track" className="flex-1 !p-3" />
              </div>
              <div className="mt-2 flex gap-2">
                <ChildCard name="Meera" grade="Grade 3" initials="M" status="Soon" className="flex-1 !p-3" />
              </div>
            </div>
          </FloatingLayer>

          <FloatingLayer mx={mx} my={my} depth={32} rotate={4} delay={0.4} duration={5.5} className="right-0 top-0 w-[230px]">
            <div className="glass-surface space-y-2 rounded-[22px] p-4">
              <ChatBubble role="user">Any exams this week?</ChatBubble>
              <ChatBubble role="ai">Yes — Science on Thursday. I&apos;ve added a reminder.</ChatBubble>
            </div>
          </FloatingLayer>

          <FloatingLayer mx={mx} my={my} depth={36} rotate={2} delay={0.15} duration={4.5} className="left-[26%] top-[248px] w-[190px]">
            <NotificationChip text="New circular from school" time="2m" />
          </FloatingLayer>

          <HomeworkFloat mx={mx} my={my} />

          <FloatingLayer mx={mx} my={my} depth={38} rotate={5} delay={0.6} duration={5} className="right-2 top-[280px] w-[210px]">
            <ExamReminderCard subject="Science" date="Thu, Nov 20" daysLeft={3} />
          </FloatingLayer>

          <FloatingLayer mx={mx} my={my} depth={20} rotate={-2} delay={0.2} duration={6.5} className="left-4 bottom-10 w-[220px]">
            <PDFCard name="Term Circular.pdf" meta="AI summarized" />
          </FloatingLayer>

          <FloatingLayer mx={mx} my={my} depth={28} rotate={-4} delay={0.5} duration={5.2} className="right-0 bottom-0 w-[200px]">
            <CalendarMini />
          </FloatingLayer>
        </div>
      </div>
    </section>
  );
}

function HomeworkFloat({ mx, my }: { mx: MotionValue<number>; my: MotionValue<number> }) {
  return (
    <FloatingLayer mx={mx} my={my} depth={24} rotate={-5} delay={0.3} duration={5.8} className="left-[5%] top-[360px] w-[230px]">
      <HomeworkCard subject="Mathematics" due="Due tomorrow" progress={65} />
    </FloatingLayer>
  );
}
