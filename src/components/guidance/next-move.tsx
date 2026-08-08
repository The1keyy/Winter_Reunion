import Link from "next/link";

export interface NextMoveStep {
  id: string;
  label: string;
  detail: string;
  href: string;
  cta: string;
  done: boolean;
  priority?: boolean;
}

interface NextMoveProps {
  steps: NextMoveStep[];
  name?: string | null;
}

/**
 * Goal-gradient checklist: one clear next action, incomplete items first.
 * Built for low cognitive load (Hick's law) + Zeigarnik pull to finish.
 */
export function NextMove({ steps, name }: NextMoveProps) {
  const doneCount = steps.filter((step) => step.done).length;
  const total = steps.length;
  const progress = total === 0 ? 100 : Math.round((doneCount / total) * 100);
  const next = steps.find((step) => !step.done);
  const allDone = !next;

  return (
    <section className="wr-panel wr-fade-up flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="wr-section-label">Your next move</span>
          <h2 className="font-heading text-lg font-semibold text-off-white md:text-xl">
            {allDone
              ? `You're locked in${name ? `, ${name.split(" ")[0]}` : ""}.`
              : next
                ? next.label
                : "You're set."}
          </h2>
          <p className="wr-hint">
            {allDone
              ? "Nothing blocking you. Browse Talk or check trip status below."
              : next?.detail}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-heading text-2xl font-semibold text-ember tabular-nums">
            {doneCount}/{total}
          </p>
          <p className="text-[11px] tracking-wide text-warm-gray uppercase">
            done
          </p>
        </div>
      </div>

      <div className="wr-progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>

      {next ? (
        <Link href={next.href} className="wr-btn-primary w-full sm:w-fit">
          {next.cta}
        </Link>
      ) : (
        <Link href="/talk" className="wr-btn w-full sm:w-fit">
          Open Talk
        </Link>
      )}

      <ul className="flex flex-col gap-2 border-t border-warm-gray/20 pt-3">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={
                "flex items-center gap-3 px-1 py-2 text-sm transition-colors " +
                (step.done
                  ? "text-warm-gray hover:text-off-white/80"
                  : "text-off-white hover:text-ember")
              }
            >
              <span
                className={
                  "flex size-5 shrink-0 items-center justify-center border text-[10px] font-semibold " +
                  (step.done
                    ? "border-winter-green bg-winter-green/15 text-winter-green"
                    : "border-ember/70 text-ember")
                }
                aria-hidden
              >
                {step.done ? "OK" : "!"}
              </span>
              <span className="flex-1">{step.label}</span>
              <span className="text-xs text-warm-gray">
                {step.done ? "Done" : "Do this"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
