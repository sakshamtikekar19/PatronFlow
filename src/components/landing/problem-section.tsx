"use client";

import { ArrowDown, X } from "lucide-react";
import { PROBLEM_FLOW, PROBLEMS } from "@/config/landing";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The Problem"
          title="Most Restaurants Lose Customers After Every Visit"
        />

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          {/* Flow */}
          <Reveal className="mx-auto w-full max-w-sm">
            <div className="flex flex-col items-stretch gap-3">
              {PROBLEM_FLOW.map((step, i) => {
                const isLast = i === PROBLEM_FLOW.length - 1;
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={
                        "w-full rounded-2xl border px-5 py-4 text-center text-sm font-medium shadow-[0_1px_3px_rgba(0,0,0,0.06)] " +
                        (isLast
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-neutral-100 bg-white text-neutral-800")
                      }
                    >
                      {step}
                    </div>
                    {!isLast && (
                      <ArrowDown className="my-1 h-4 w-4 text-neutral-300" />
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Problems list */}
          <div className="space-y-3">
            {PROBLEMS.map((problem, i) => (
              <Reveal
                key={problem}
                index={i}
                className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                  <X className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  {problem}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
