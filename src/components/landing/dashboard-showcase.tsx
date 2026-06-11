"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SHOWCASE } from "@/config/landing";
import { SectionHeading } from "./section-heading";
import { LandingIcon } from "./landing-icons";

export function DashboardShowcase() {
  return (
    <section className="bg-white/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Dashboard"
          title="Everything You Need In One Dashboard"
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {SHOWCASE.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: (i % 2) * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl bg-gradient-to-br from-neutral-200/70 via-neutral-100/40 to-amber-100/40 p-[1.5px] shadow-[0_10px_40px_-12px_rgba(0,0,0,0.2)] transition-all"
            >
              <div className="overflow-hidden rounded-3xl bg-white">
                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                      <LandingIcon name={card.icon} className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">
                      {card.title}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
                  </div>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-neutral-50 to-white">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
