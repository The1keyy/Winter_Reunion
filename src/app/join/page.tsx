import Link from "next/link";

import { JoinForm } from "@/components/auth/join-form";

export default function JoinPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <div className="wr-fade-up flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="wr-section-label">Invite only</span>
          <h1 className="font-heading text-3xl font-semibold text-off-white md:text-4xl">
            Winter Reunion 2027
          </h1>
          <p className="text-sm leading-relaxed text-off-white/70 md:text-[15px]">
            Three quick steps. Screenshot your login at the end — that&apos;s
            your key back in.
          </p>
        </div>

        <div className="wr-panel">
          <JoinForm />
        </div>

        <p className="text-sm text-warm-gray">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-ice underline-offset-4 hover:text-off-white hover:underline"
          >
            Sign in instead
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
