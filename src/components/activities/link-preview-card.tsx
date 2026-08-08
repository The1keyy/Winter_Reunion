interface LinkPreviewCardProps {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Compact link chip — image + title only, no wall of text. */
export function LinkPreviewCard({
  url,
  title,
  description,
  image,
}: LinkPreviewCardProps) {
  void description;
  const host = hostnameOf(url);
  const headline = title?.trim() || host;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex overflow-hidden rounded-xl border border-warm-gray/30 bg-charcoal/40 transition-[border-color,background-color] duration-150 hover:border-ice/50 hover:bg-surface-raised"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote OG images from many hosts
        <img
          src={image}
          alt=""
          className="h-16 w-20 shrink-0 object-cover sm:h-[4.5rem] sm:w-24"
        />
      ) : (
        <div className="flex h-16 w-20 shrink-0 items-center justify-center bg-surface-raised text-[10px] font-semibold tracking-wide text-ice uppercase sm:h-[4.5rem] sm:w-24">
          Link
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-2">
        <span className="text-[10px] font-semibold tracking-wide text-ice uppercase">
          {host}
        </span>
        <span className="line-clamp-2 text-sm font-semibold text-off-white group-hover:text-ember">
          {headline}
        </span>
      </div>
    </a>
  );
}
