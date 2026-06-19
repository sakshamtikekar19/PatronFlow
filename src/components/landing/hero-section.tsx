"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp, Users } from "lucide-react";
import { HERO, HERO_IMAGE } from "@/config/landing";
import { ContactCtaGroup } from "./contact-cta-group";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Ambient gradient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-200/40 via-orange-100/30 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-left"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-neutral-600 backdrop-blur"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            Restaurant Growth Platform
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl"
          >
            {HERO.headline}
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-600 lg:mx-0 sm:text-lg"
          >
            {HERO.subheadline}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col items-center gap-4 lg:items-start"
          >
            <ContactCtaGroup
              size="lg"
              className="w-full lg:justify-start"
              whatsappLabel="Contact on WhatsApp"
              emailLabel="Email us"
            />
            <Link
              href="#features"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-8 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
            >
              View Features
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Dashboard showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="relative rounded-3xl bg-gradient-to-br from-amber-300/60 via-neutral-200/50 to-orange-200/60 p-[1.5px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]">
            <div className="relative overflow-hidden rounded-3xl bg-white">
              {/* Faux dashboard chrome */}
              <div className="flex items-center gap-1.5 border-b border-neutral-100 bg-neutral-50/80 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={HERO_IMAGE}
                  alt="PatronFlow dashboard"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Floating UI cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute -left-4 top-16 hidden rounded-2xl border border-neutral-100 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:block"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Star className="h-4 w-4" />
              </span>
              <div className="text-left">
                <p className="text-xs text-neutral-500">New 5★ review</p>
                <p className="text-sm font-semibold text-neutral-900">
                  +1 on Google
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="absolute -right-3 bottom-12 hidden rounded-2xl border border-neutral-100 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:block"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </span>
              <div className="text-left">
                <p className="text-xs text-neutral-500">Repeat visits</p>
                <p className="text-sm font-semibold text-neutral-900">+35%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute -left-6 bottom-24 hidden rounded-2xl border border-neutral-100 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] lg:block"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Users className="h-4 w-4" />
              </span>
              <div className="text-left">
                <p className="text-xs text-neutral-500">New patron</p>
                <p className="text-sm font-semibold text-neutral-900">
                  Profile saved
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
