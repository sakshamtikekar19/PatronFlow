"use client";

import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/config/landing";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved By Restaurant Teams"
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.role}
              index={i}
              className="flex flex-col rounded-3xl border border-neutral-100 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            >
              <Quote className="h-7 w-7 text-amber-400" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-700">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                  {t.role.charAt(0)}
                </span>
                <span className="text-sm font-medium text-neutral-900">
                  {t.role}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
