interface FormNoticeProps {
  tone: "error" | "success";
  children: React.ReactNode;
}

/**
 * Accent-bordered feedback so success and error are easy to tell apart
 * without loud alert chrome.
 */
export function FormNotice({ tone, children }: FormNoticeProps) {
  return (
    <p
      className={
        "border-l-2 py-1.5 pl-3 text-sm font-medium " +
        (tone === "success"
          ? "border-winter-green text-winter-green"
          : "border-ember text-off-white/90")
      }
    >
      {children}
    </p>
  );
}
