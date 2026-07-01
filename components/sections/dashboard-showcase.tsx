"use client";

import { Bell } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import AmbientBackground from "@/components/ui/ambient-background";
import {
  ChildCard,
  HomeworkCard,
  ExamReminderCard,
  FeeStatusCard,
  PDFCard,
  NotificationChip,
} from "@/components/dashboard/cards";
import { CalendarMini } from "@/components/dashboard/calendar-mini";
import { AttendanceRing } from "@/components/dashboard/attendance-ring";
import { SearchBar } from "@/components/dashboard/search-bar";

export default function DashboardShowcase() {
  return (
    <section id="dashboard" className="relative px-6 py-32">
      <AmbientBackground />

      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-primary/70">
            The dashboard
          </p>
          <h2 className="mt-3 text-balance font-display text-[38px] font-bold tracking-tight text-ink sm:text-[52px]">
            Documents become a searchable, living dashboard.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-surface overflow-hidden rounded-[22px] p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <SearchBar className="flex-1" />
              <div className="flex items-center gap-3 rounded-[18px] border border-hairline bg-white/50 px-4 py-3">
                <Bell className="h-4 w-4 text-ink/50" />
                <span className="text-[13px] text-ink/60">3 new updates</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* column 1 */}
              <div className="flex flex-col gap-5">
                <ChildCard name="Aarav Mehta" grade="Grade 6 · Riverdale School" initials="A" status="On track" />
                <ChildCard name="Meera Mehta" grade="Grade 3 · Riverdale School" initials="M" status="Exam soon" />
                <AttendanceRing percent={96} />
              </div>

              {/* column 2 */}
              <div className="flex flex-col gap-5">
                <p className="text-[12.5px] font-medium uppercase tracking-wide text-ink/40">
                  Homework
                </p>
                <HomeworkCard subject="Mathematics" due="Due tomorrow" progress={65} />
                <HomeworkCard subject="English Essay" due="Due Friday" progress={30} />
                <p className="mt-2 text-[12.5px] font-medium uppercase tracking-wide text-ink/40">
                  Upcoming Exams
                </p>
                <ExamReminderCard subject="Science" date="Thu, Nov 20" daysLeft={3} />
              </div>

              {/* column 3 */}
              <div className="flex flex-col gap-5">
                <FeeStatusCard amount="$1,240" status="Due" due="Due in 12 days" />
                <CalendarMini />
                <NotificationChip text="New circular: Sports Day schedule" time="2m" />
                <PDFCard name="Term_Circular.pdf" meta="AI summarized" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
