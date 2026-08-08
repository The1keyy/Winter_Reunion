import Link from "next/link";

import type { HomeUpdateItem } from "@/lib/updates/build-home-updates";

interface HomeUpdatesProps {
  personal: HomeUpdateItem[];
  group: HomeUpdateItem[];
  hasPhone: boolean;
}

function Chip({ item }: { item: HomeUpdateItem }) {
  const className =
    "inline-flex max-w-full items-center gap-2 border border-warm-gray/30 px-2.5 py-1.5 text-left text-xs font-normal text-off-white/85 transition-colors hover:border-off-white/60";

  const label = (
    <>
      <span className="truncate">{item.headline}</span>
      {item.href && item.cta ? (
        <span className="shrink-0 text-off-white/50">{item.cta}</span>
      ) : null}
    </>
  );

  if (!item.href) {
    return <div className={className}>{label}</div>;
  }

  if (item.href.startsWith("http")) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={item.detail}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} title={item.detail}>
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
      <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
        {label}
        {items.length > 0 ? (
          <span className="ml-2 normal-case tracking-normal text-off-white/40">
            {items.length}
          </span>
        ) : null}
      </span>
      {items.length === 0 ? (
        <p className="text-xs font-normal text-off-white/40">{empty}</p>
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
    <div className="flex flex-col gap-4 border-t border-warm-gray/20 pt-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-normal text-off-white">
            Notifications
            {total > 0 ? (
              <span className="ml-2 text-sm text-off-white/50">{total}</span>
            ) : null}
          </h2>
          <p className="text-xs font-normal text-off-white/50">
            Small alerts — personal ones are only yours; group ones are for
            everyone.
          </p>
        </div>
        <p className="text-xs font-normal text-off-white/40">
          {hasPhone
            ? "Number on file for Key to text urgent stuff."
            : "Add your number above so Key can reach you."}
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
    </div>
  );
}
