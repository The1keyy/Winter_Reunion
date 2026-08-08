"use client";

import { useEffect, useState } from "react";

interface AddOptionBoxProps {
  label: string;
  children: (close: () => void) => React.ReactNode;
  /** When this changes after a successful post, collapse the box */
  doneAt?: number;
}

/**
 * Collapsed “+” affordance — keeps voting cards primary (Hick’s law),
 * expands only when someone wants to propose.
 */
export function AddOptionBox({ label, children, doneAt }: AddOptionBoxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (doneAt) setOpen(false);
  }, [doneAt]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3 rounded-2xl border border-dashed border-warm-gray/40 bg-surface/40 px-4 py-4 text-left transition-[border-color,background-color] duration-150 hover:border-ember/60 hover:bg-surface"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ember/50 bg-ember/10 font-heading text-xl font-semibold text-ember transition-colors group-hover:bg-ember group-hover:text-ember-ink">
          +
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="font-heading text-sm font-semibold text-off-white">
            {label}
          </span>
          <span className="text-xs text-warm-gray">
            Nothing required — drop whatever you know
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="wr-fade-up wr-panel flex flex-col gap-4 border-ember/35">
      <div className="flex items-center justify-between gap-3">
        <span className="wr-section-label">{label}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-medium text-warm-gray hover:text-off-white"
        >
          Close
        </button>
      </div>
      {children(() => setOpen(false))}
    </div>
  );
}
