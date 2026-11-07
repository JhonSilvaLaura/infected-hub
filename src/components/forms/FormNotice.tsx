"use client";

import { AnimatePresence, motion } from "motion/react";
import { Info } from "lucide-react";

/**
 * Shown after a valid submit while there is no API.
 * States plainly that nothing was sent instead of faking a success.
 */
export function FormNotice({ message }: { message: string | null }) {
  return (
    <div aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-2.5 rounded-[3px] border border-flare/40 bg-flare/10 p-3 text-sm text-bone/90"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-flare" aria-hidden />
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
