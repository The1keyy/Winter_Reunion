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
            Enter the trip passcode to create your account.
          </p>
        </div>

        <JoinForm />
      </div>
    </main>
  );
}
