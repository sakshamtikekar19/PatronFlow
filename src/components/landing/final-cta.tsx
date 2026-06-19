"use client";

import { motion } from "framer-motion";
import { ContactCtaGroup } from "./contact-cta-group";
import { ContactLinkInline } from "@/components/contact/contact-link-inline";

export function FinalCta() {
  return (
    <section id="contact" className="px-4 py-20 sm:px-6 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-neutral-900 px-6 py-16 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] sm:px-12 sm:py-20"
      >
        {/* Glow accents */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Ready To Grow Your Restaurant?
        </h2>
        <p className="relative mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
          See how PatronFlow can help increase reviews, improve guest
          experience, and drive repeat business.
        </p>
        <div className="relative mt-9 flex flex-col items-center gap-6">
          <ContactCtaGroup
            size="lg"
            theme="dark"
            whatsappLabel="Chat on WhatsApp"
            emailLabel="Email us"
          />
          <ContactLinkInline
            stacked={false}
            linkClassName="text-neutral-300 hover:text-white"
          />
        </div>
      </motion.div>
    </section>
  );
}
