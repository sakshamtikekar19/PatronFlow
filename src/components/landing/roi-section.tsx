"use client";

import { ROI_METRICS, ROI_DISCLAIMER } from "@/config/landing";
import { SectionHeading } from "./section-heading";
import { AnimatedCounter } from "./animated-counter";
import { Reveal } from "./reveal";

export function RoiSection() {
  return (
    <section className="bg-white/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="ROI"
          title="Built To Drive Restaurant Growth"
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROI_METRICS.map((metric, i) => (
            <Reveal
              key={metric.label}
              index={i}
              className="relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-amber-200/50 to-orange-100/30 blur-2xl" />
              <span className="relative text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
                <AnimatedCounter value={metric.value} suffix={metric.suffix} />
              </span>
              <p className="relative mt-3 text-sm font-medium text-neutral-500">
                {metric.label}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal index={4}>
          <p className="mt-10 text-center text-xs text-neutral-400">
            {ROI_DISCLAIMER}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
