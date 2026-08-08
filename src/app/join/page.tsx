import Link from "next/link";

import { JoinForm } from "@/components/auth/join-form";

export default function JoinPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-charcoal px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-light text-off-white md:text-3xl">
            Winter Reunion 2027
          </h1>
          <p className="text-sm font-normal text-off-white/70">
            Quick setup: first name, last initial, email, a password you pick,
            and the trip passcode from Key.
          </p>
        </div>

        <JoinForm />

        <p className="text-sm font-normal text-off-white/50">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-off-white/80 underline underline-offset-4 hover:text-off-white"
          >
            Sign in instead
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
