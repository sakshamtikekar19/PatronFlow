"use client";

import { SOCIAL_PROOF } from "@/config/landing";
import { AnimatedCounter } from "./animated-counter";
import { Reveal } from "./reveal";

export function SocialProof() {
  return (
    <section className="border-y border-neutral-200/70 bg-white/50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 lg:grid-cols-4">
        {SOCIAL_PROOF.map((metric, i) => (
          <Reveal
            key={metric.label}
            index={i}
            className="flex flex-col items-center gap-2 px-4 py-10 text-center lg:py-14"
          >
            <span className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
              <AnimatedCounter value={metric.value} suffix={metric.suffix} />
            </span>
            <span className="text-sm font-medium text-neutral-500">
              {metric.label}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
