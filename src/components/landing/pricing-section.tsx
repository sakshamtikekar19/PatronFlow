"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { PRICING } from "@/config/landing";
import { BILLING_CONFIG } from "@/lib/billing/config";
import { SectionHeading } from "./section-heading";

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="One Plan. Every Feature."
          description="Simple pricing for Indian restaurants — start with a free trial, then one flat monthly fee."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-14 max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />

            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Most popular
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-neutral-900">
                  {PRICING.planName}
                </h3>
                <p className="mt-2 max-w-md text-sm text-neutral-500">
                  {PRICING.tagline}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                  {PRICING.priceDisplay}
                  <span className="text-lg font-medium text-neutral-500">
                    /{PRICING.period}
                  </span>
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {BILLING_CONFIG.trialDays}-day free trial included
                </p>
              </div>
            </div>

            <ul className="relative mt-10 grid gap-3 sm:grid-cols-2">
              {PRICING.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-neutral-700"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="relative mt-10">
              <Link
                href="/signup"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Start free trial
              </Link>
            </div>

            <p className="relative mt-4 text-center text-xs text-neutral-400">
              Billed monthly via Razorpay · Cancel anytime from your billing page
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
