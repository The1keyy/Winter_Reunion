import { LoginForm } from "@/components/auth/login-form";
import { FormNotice } from "@/components/ui/form-notice";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-charcoal px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-light text-off-white md:text-3xl">
            Winter Reunion 2027
          </h1>
          <p className="text-sm font-normal text-off-white/70">
            Sign in with the email and password you chose (or screenshotted)
            when you joined.
          </p>
        </div>

        {params.confirmed ? (
          <FormNotice tone="success">
            Email confirmed. Sign in with your email + password below.
          </FormNotice>
        ) : null}

        <LoginForm />
      </div>
    </main>
  );
}
