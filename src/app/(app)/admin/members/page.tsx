import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { getAllProfiles, getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(supabase, user.id);

  if (profile?.role !== "admin") {
    redirect("/home");
  }

  const members = await getAllProfiles(supabase);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          Members
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          Set a new password for anyone who&apos;s locked out. There&apos;s
          no way to view someone&apos;s existing password - it&apos;s never
          stored anywhere in a readable form - but you can set a new one for
          them and pass it along yourself.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {members.length === 0 ? (
          <p className="text-sm font-normal text-off-white/60">
            No members yet.
          </p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 border border-warm-gray/20 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-normal text-off-white">
                  {member.name}
                </h2>
                <span className="text-sm font-normal text-off-white/50">
                  {member.email}
                </span>
                <span className="border border-warm-gray/50 px-1.5 py-0.5 text-xs text-off-white/70">
                  {member.role}
                </span>
              </div>
              <ResetPasswordForm
                profileId={member.id}
                memberName={member.name}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
