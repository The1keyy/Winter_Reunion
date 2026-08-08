export interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  hostname: string;
}

function metaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtml(match[1].trim());
    }
  }
  return null;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function titleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1] ? decodeHtml(match[1].trim()) : null;
}

function absolutize(base: URL, value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

/**
 * Best-effort Open Graph preview. Many sites (including some Airbnb pages)
 * block bots — we still return hostname + URL so the card stays useful.
 */
export async function fetchLinkPreview(
  rawUrl: string
): Promise<LinkPreview | null> {
  let url: URL;
  try {
    url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  } catch {
    return null;
  }

  const fallback: LinkPreview = {
    url: url.toString(),
    title: null,
    description: null,
    image: null,
    hostname: url.hostname.replace(/^www\./, ""),
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WinterReunionBot/1.0; +https://winter-reunion.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });
    clearTimeout(timer);

    if (!response.ok) return fallback;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("xml")) {
      return fallback;
    }

    const html = (await response.text()).slice(0, 200_000);
    const title =
      metaContent(html, "og:title") ??
      metaContent(html, "twitter:title") ??
      titleTag(html);
    const description =
      metaContent(html, "og:description") ??
      metaContent(html, "twitter:description") ??
      metaContent(html, "description");
    const image = absolutize(
      url,
      metaContent(html, "og:image") ?? metaContent(html, "twitter:image")
    );

    return {
      ...fallback,
      title,
      description,
      image,
    };
  } catch {
    return fallback;
  }
}
