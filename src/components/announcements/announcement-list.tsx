import { Avatar } from "@/components/ui/avatar";
import { relativeTime } from "@/lib/format-relative-time";
import type { Announcement } from "@/types/database";

interface AnnouncementListProps {
  announcements: Announcement[];
  nameById?: Map<string, string>;
}

function linkLabel(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return `Open ${host}`;
  } catch {
    return "Open link";
  }
}

export function AnnouncementList({
  announcements,
  nameById,
}: AnnouncementListProps) {
  if (announcements.length === 0) {
    return <p className="wr-hint">No updates yet. Check back soon.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {announcements.map((announcement) => {
        const authorName =
          (announcement.author_id && nameById?.get(announcement.author_id)) ||
          "Key";

        return (
          <article
            key={announcement.id}
            className="wr-post-card flex gap-3"
          >
            <Avatar name={authorName} size="sm" className="mt-0.5" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <span className="text-sm font-semibold text-off-white">
                  {authorName}
                </span>
                <span className="text-xs text-warm-gray">·</span>
                <span className="text-xs text-warm-gray">
                  {relativeTime(announcement.created_at)}
                </span>
                {announcement.pinned ? (
                  <span className="ml-1 rounded-full border border-winter-green/70 bg-winter-green/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-winter-green uppercase">
                    Pinned
                  </span>
                ) : null}
              </div>
              <h3 className="font-heading text-sm font-semibold text-off-white">
                {announcement.title}
              </h3>
              <p className="text-sm whitespace-pre-wrap text-off-white/75">
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
            </div>
          </article>
        );
      })}
    </div>
  );
}
