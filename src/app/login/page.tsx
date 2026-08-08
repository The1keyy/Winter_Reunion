import { LoginForm } from "@/components/auth/login-form";
import { FormNotice } from "@/components/ui/form-notice";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <div className="wr-fade-up flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="wr-section-label">Crew access</span>
          <h1 className="font-heading text-3xl font-semibold text-off-white md:text-4xl">
            Winter Reunion 2027
          </h1>
          <p className="text-sm leading-relaxed text-off-white/70 md:text-[15px]">
            Sign in with the email and password you chose (or screenshotted)
            when you joined.
          </p>
        </div>

        {params.confirmed ? (
          <FormNotice tone="success">
            Email confirmed. Sign in with your email + password below.
          </FormNotice>
        ) : null}

        <div className="wr-panel">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
