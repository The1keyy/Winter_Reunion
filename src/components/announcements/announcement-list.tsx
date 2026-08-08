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

export function AnnouncementList({ announcements }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return (
      <p className="text-sm font-normal text-off-white/60">
        No announcements yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="flex flex-col gap-1 border-b border-warm-gray/20 pb-4 last:border-b-0 last:pb-0"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-normal text-off-white">
              {announcement.title}
            </h3>
            {announcement.pinned ? (
              <span className="border border-winter-green px-1.5 py-0.5 text-xs text-winter-green">
                Pinned
              </span>
            ) : null}
            <span className="text-xs text-off-white/40">
              {formatDate(announcement.created_at)}
            </span>
          </div>
          <p className="text-sm font-normal whitespace-pre-wrap text-off-white/70">
            {announcement.body}
          </p>
        </div>
      ))}
    </div>
  );
}
