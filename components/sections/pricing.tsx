"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import MagneticButton from "@/components/ui/magnetic-button";
import AmbientBackground from "@/components/ui/ambient-background";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For one child, one school.",
    features: ["1 child profile", "Document search", "Basic reminders", "Email support"],
    highlighted: false,
  },
  {
    name: "Family",
    price: "$12",
    period: "/month",
    description: "For families managing multiple children.",
    features: [
      "Unlimited children",
      "AI assistant & search",
      "Fee & attendance tracking",
      "Priority notifications",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "School",
    price: "Custom",
    period: "",
    description: "For schools rolling out to every parent.",
    features: [
      "Everything in Family",
      "School-wide broadcast tools",
      "Admin dashboard",
      "Dedicated onboarding",
    ],
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative px-6 py-32">
      <AmbientBackground variant="quiet" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-16 max-w-xl text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-primary/70">
            Pricing
          </p>
          <h2 className="mt-3 text-balance font-display text-[38px] font-bold tracking-tight text-ink sm:text-[52px]">
            Simple pricing, for every family.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn(
                  "relative h-full rounded-[22px] p-[1.5px]",
                  plan.highlighted && "bg-[image:var(--gradient-brand)]"
                )}
              >
                <div
                  className={cn(
                    "flex h-full flex-col rounded-[21px] p-7",
                    plan.highlighted ? "bg-white/90" : "glass-surface"
                  )}
                >
                  {plan.highlighted && (
                    <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[image:var(--gradient-brand)] px-3 py-1 text-[11.5px] font-medium text-white">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-[18px] font-semibold text-ink">{plan.name}</h3>
                  <p className="mt-1 text-[13.5px] text-ink/50">{plan.description}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-[38px] font-bold tracking-tight text-ink">
                      {plan.price}
                    </span>
                    <span className="text-[14px] text-ink/45">{plan.period}</span>
                  </div>

                  <ul className="mt-7 flex-1 space-y-3.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink/70">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <MagneticButton
                    fullWidth
                    className={cn(
                      "mt-8",
                      plan.highlighted ? "bg-ink text-white hover:bg-primary" : "border border-hairline-strong text-ink hover:bg-white/60"
                    )}
                    strength={0.15}
                  >
                    Choose {plan.name}
                  </MagneticButton>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
