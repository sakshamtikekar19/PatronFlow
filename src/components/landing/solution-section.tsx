"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SOLUTION_FLOW } from "@/config/landing";
import { SectionHeading } from "./section-heading";
import { LandingIcon } from "./landing-icons";

export function SolutionSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-100/40 via-amber-100/30 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How It Works"
          title="One Platform To Manage The Entire Guest Journey"
        />

        <div className="mt-16">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-center">
            {SOLUTION_FLOW.map((step, i) => {
              const isLast = i === SOLUTION_FLOW.length - 1;
              return (
                <div
                  key={step.label}
                  className="flex flex-col items-center md:flex-row"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group flex w-40 flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white transition-transform group-hover:scale-105">
                      <LandingIcon name={step.icon} className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">
                      {step.label}
                    </span>
                    <span className="text-xs font-medium text-neutral-400">
                      Step {i + 1}
                    </span>
                  </motion.div>

                  {!isLast && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.12 + 0.1 }}
                      className="my-1 md:my-0 md:mx-1"
                    >
                      <ArrowRight className="hidden h-5 w-5 text-neutral-300 md:block" />
                      <ArrowRight className="h-5 w-5 rotate-90 text-neutral-300 md:hidden" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
