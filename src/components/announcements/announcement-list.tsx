import { format } from "date-fns";

import type { Announcement } from "@/types/database";

interface AnnouncementListProps {
  announcements: Announcement[];
}

function formatDate(value: string) {
  try {
    return format(new Date(value), "MMM d");
  } catch {
    return value;
  }
}

function linkLabel(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return `Open ${host}`;
  } catch {
    return "Open link";
  }
}

export function AnnouncementList({ announcements }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return (
      <p className="wr-hint">No updates yet. Check back soon.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {announcements.map((announcement) => (
        <article key={announcement.id} className="wr-panel flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-sm font-semibold text-off-white">
              {announcement.title}
            </h3>
            {announcement.pinned ? (
              <span className="border border-winter-green/70 bg-winter-green/10 px-1.5 py-0.5 text-[11px] font-semibold text-winter-green">
                Pinned
              </span>
            ) : null}
            <span className="text-xs text-warm-gray">
              {formatDate(announcement.created_at)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap text-off-white/70">
            {announcement.body}
          </p>
          {announcement.link_url ? (
            <a
              href={announcement.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 w-fit text-sm font-medium text-ice underline-offset-4 hover:text-off-white hover:underline"
            >
              {linkLabel(announcement.link_url)}
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
