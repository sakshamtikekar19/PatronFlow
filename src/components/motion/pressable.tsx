"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/** Subtle press feedback for buttons and clickable cards. */
export function Pressable({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.12 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
