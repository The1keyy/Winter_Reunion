interface PageGuideProps {
  step?: string;
  title: string;
  body: string;
}

/** Short orientation block at the top of a page — recognition over recall. */
export function PageGuide({ step, title, body }: PageGuideProps) {
  return (
    <div className="wr-fade-up flex flex-col gap-1.5">
      {step ? <span className="wr-section-label">{step}</span> : null}
      <h1 className="font-heading text-2xl font-semibold text-off-white md:text-3xl">
        {title}
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-off-white/70 md:text-[15px]">
        {body}
      </p>
    </div>
  );
}
