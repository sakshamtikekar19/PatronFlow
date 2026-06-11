"use client";

import { Check, X } from "lucide-react";
import { ADVANTAGES_WITH, ADVANTAGES_WITHOUT } from "@/config/landing";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

export function AdvantagesSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why PatronFlow"
          title="Why Restaurants Choose PatronFlow"
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* With PatronFlow */}
          <Reveal className="relative overflow-hidden rounded-3xl border border-neutral-900 bg-neutral-900 p-8 text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)]">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
            <h3 className="text-lg font-semibold">With PatronFlow</h3>
            <ul className="mt-6 space-y-3">
              {ADVANTAGES_WITH.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-neutral-100">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Without PatronFlow */}
          <Reveal
            index={1}
            className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <h3 className="text-lg font-semibold text-neutral-900">
              Without PatronFlow
            </h3>
            <ul className="mt-6 space-y-3">
              {ADVANTAGES_WITHOUT.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400">
                    <X className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-neutral-500">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
