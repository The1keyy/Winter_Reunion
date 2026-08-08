import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-charcoal px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-light text-off-white md:text-3xl">
            Winter Reunion 2027
          </h1>
          <p className="text-sm font-normal text-off-white/70">
            Use the email and the password you chose when you joined.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
