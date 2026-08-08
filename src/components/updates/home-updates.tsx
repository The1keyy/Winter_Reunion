import Link from "next/link";

import type { HomeUpdateItem } from "@/lib/updates/build-home-updates";

interface HomeUpdatesProps {
  personal: HomeUpdateItem[];
  group: HomeUpdateItem[];
}

function UpdateCard({ item }: { item: HomeUpdateItem }) {
  const className =
    "flex flex-col gap-1 border border-warm-gray/20 p-3 transition-colors";
  const body = (
    <>
      <p className="text-sm font-normal text-off-white">{item.headline}</p>
      <p className="text-sm font-normal text-off-white/60">{item.detail}</p>
      {item.href ? (
        <span className="mt-1 text-sm font-normal text-off-white/80 underline underline-offset-4">
          {item.cta}
        </span>
      ) : (
        <span className="mt-1 text-sm font-normal text-off-white/40">
          {item.cta}
        </span>
      )}
    </>
  );

  if (!item.href) {
    return <div className={className}>{body}</div>;
  }

  if (item.href.startsWith("http")) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} hover:border-off-white/50`}
      >
        {body}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className={`${className} hover:border-off-white/50`}
    >
      {body}
    </Link>
  );
}

function UpdateBlock({
  label,
  hint,
  items,
}: {
  label: string;
  hint: string;
  items: HomeUpdateItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
            {label}
          </span>
          <p className="text-sm font-normal text-off-white/50">{hint}</p>
        </div>
        <p className="text-sm font-normal text-off-white/40">Nothing new here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          {label}
        </span>
        <p className="text-sm font-normal text-off-white/50">{hint}</p>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <UpdateCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function HomeUpdates({ personal, group }: HomeUpdatesProps) {
  return (
    <div className="flex flex-col gap-6 border-t border-warm-gray/20 pt-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-normal text-off-white">
          What&apos;s new
        </h2>
        <p className="text-sm font-normal text-off-white/60">
          Personal stuff is only yours. Group updates are for everyone.
        </p>
      </div>
      <UpdateBlock
        label="Just for you"
        hint="Payments, RSVP, and anything that only applies to you."
        items={personal}
      />
      <UpdateBlock
        label="For everyone"
        hint="Announcements, votes, and trip-wide moves."
        items={group}
      />
    </div>
  );
}
