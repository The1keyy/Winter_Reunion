/** Deterministic, on-brand palette — no random neon avatars. */
const AVATAR_PALETTE = [
  "#d4a04a", // ember
  "#6d93b0", // ice
  "#4d7a5c", // winter-green
  "#b0705a", // clay
  "#7a6bb0", // dusk violet
  "#5a9ba8", // teal ice
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const SIZE_CLASSES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
} as const;

interface AvatarProps {
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

/** Consistent colored-initial avatar, used across nav, Talk, and cards. */
export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const color = AVATAR_PALETTE[hashString(name || "?") % AVATAR_PALETTE.length];

  return (
    <span
      className={`wr-avatar ${SIZE_CLASSES[size]} ${className}`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}
