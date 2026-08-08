import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteAnnouncement } from "@/app/(app)/admin/announcements/actions";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { getAnnouncements } from "@/lib/supabase/announcements";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

function linkLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function AnnouncementsAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getProfile(supabase, user.id) : null;

  if (profile?.role !== "admin" && profile?.role !== "co-admin") {
    redirect("/home");
  }

  const announcements = await getAnnouncements(supabase);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          Post an update
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          Admins and co-admins can post here. Everyone sees it under
          &quot;For everyone&quot; on Home — add an Airbnb / Vrbo / Venmo link
          when people need to tap through.
        </p>
        <Link
          href="/home"
          className="mt-1 w-fit text-sm font-normal text-off-white/60 underline underline-offset-4 hover:text-off-white"
        >
          Back to home
        </Link>
      </div>

      <div className="flex flex-col gap-4 border border-warm-gray/20 p-4">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          New update
        </span>
        <AnnouncementForm />
      </div>

      <div className="flex flex-col gap-4 border-t border-warm-gray/20 pt-6">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          Posted
        </span>
        {announcements.length === 0 ? (
          <p className="text-sm font-normal text-off-white/60">
            Nothing posted yet. Your first update will show up on Home.
          </p>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="flex items-start justify-between gap-4 border border-warm-gray/20 p-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-normal text-off-white">
                    {announcement.title}
                  </h2>
                  {announcement.pinned ? (
                    <span className="border border-winter-green px-1.5 py-0.5 text-xs text-winter-green">
                      Pinned
                    </span>
                  ) : null}
                </div>
                <p className="text-sm font-normal whitespace-pre-wrap text-off-white/80">
                  {announcement.body}
                </p>
                {announcement.link_url ? (
                  <a
                    href={announcement.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                  >
                    {linkLabel(announcement.link_url)}
                  </a>
                ) : null}
              </div>
              <form action={deleteAnnouncement.bind(null, announcement.id)}>
                <button
                  type="submit"
                  className="text-sm font-normal text-off-white/50 hover:text-off-white"
                >
                  Delete
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
