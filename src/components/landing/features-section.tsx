"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/config/landing";
import { SectionHeading } from "./section-heading";
import { LandingIcon } from "./landing-icons";

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title="Everything To Grow Repeat Business"
          description="A complete toolkit that works together — from the first scan to the fifth visit."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: (i % 4) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-amber-100/0 to-amber-100/0 opacity-0 blur-2xl transition-opacity duration-300 group-hover:from-amber-200/60 group-hover:to-orange-100/40 group-hover:opacity-100" />
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white transition-transform group-hover:scale-105">
                <LandingIcon name={feature.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
