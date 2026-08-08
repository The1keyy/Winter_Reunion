interface FormNoticeProps {
  tone: "error" | "success";
  children: React.ReactNode;
}

/**
 * A small accent-bordered line for form feedback, so success and error
 * states are easy to tell apart at a glance without resorting to bright
 * alert colors or icons.
 */
export function FormNotice({ tone, children }: FormNoticeProps) {
  return (
    <p
      className={
        "border-l-2 py-1 pl-3 text-sm font-normal " +
        (tone === "success"
          ? "border-winter-green text-winter-green"
          : "border-warm-gray/60 text-off-white/90")
      }
    >
      {children}
    </p>
  );
}
