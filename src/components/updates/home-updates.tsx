import Link from "next/link";

import type { HomeUpdateItem } from "@/lib/updates/build-home-updates";

interface HomeUpdatesProps {
  personal: HomeUpdateItem[];
  group: HomeUpdateItem[];
  hasPhone: boolean;
}

function Chip({ item }: { item: HomeUpdateItem }) {
  const label = (
    <>
      <span className="truncate">{item.headline}</span>
      {item.href && item.cta ? (
        <span className="shrink-0 text-ember">{item.cta}</span>
      ) : null}
    </>
  );

  if (!item.href) {
    return <div className="wr-chip">{label}</div>;
  }

  if (item.href.startsWith("http")) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="wr-chip"
        title={item.detail}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={item.href} className="wr-chip" title={item.detail}>
      {label}
    </Link>
  );
}

function ChipRow({
  label,
  empty,
  items,
}: {
  label: string;
  empty: string;
  items: HomeUpdateItem[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="wr-section-label">
        {label}
        {items.length > 0 ? (
          <span className="ml-2 normal-case tracking-normal text-warm-gray">
            {items.length}
          </span>
        ) : null}
      </span>
      {items.length === 0 ? (
        <p className="text-xs text-warm-gray">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Chip key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HomeUpdates({ personal, group, hasPhone }: HomeUpdatesProps) {
  const total = personal.length + group.length;

  return (
    <section className="flex flex-col gap-4 border-t border-warm-gray/20 pt-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-heading text-lg font-semibold text-off-white">
            Alerts
            {total > 0 ? (
              <span className="ml-2 text-sm font-medium text-ember">{total}</span>
            ) : null}
          </h2>
          <p className="wr-hint">
            Personal = only you. Group = whole crew.
          </p>
        </div>
        <p className="text-xs text-warm-gray">
          {hasPhone
            ? "Number on file for urgent texts."
            : "Add your number so Key can reach you."}
        </p>
      </div>
      <ChipRow
        label="Just for you"
        empty="You're caught up personally."
        items={personal}
      />
      <ChipRow
        label="For everyone"
        empty="No group alerts right now."
        items={group}
      />
    </section>
  );
}
