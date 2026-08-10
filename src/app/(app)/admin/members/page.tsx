import { redirect } from "next/navigation";

import { deleteMember } from "@/app/(app)/admin/members/actions";
import { CreateMemberForm } from "@/components/admin/create-member-form";
import { MemberRoleForm } from "@/components/admin/member-role-form";
import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
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
          Change roles, reset passwords, or delete people. Changes show up right
          away on Home / Dashboard. Passwords can&apos;t be viewed — only reset.
        </p>
      </div>

      <div className="flex flex-col gap-2 border border-warm-gray/20 p-4">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          Your admin login
        </span>
        <p className="text-sm font-normal text-off-white">
          <span className="text-off-white/50">Name: </span>
          {profile.name}
        </p>
        <p className="text-sm font-normal text-off-white">
          <span className="text-off-white/50">Email: </span>
          {profile.email || user.email}
        </p>
        <p className="text-sm font-normal text-off-white/60">
          Sign in at https://winter-reunion.vercel.app/login with that email and
          your admin password.
        </p>
      </div>

      <CreateMemberForm />

      <div className="flex flex-col gap-6">
        {members.length === 0 ? (
          <p className="text-sm font-normal text-off-white/60">
            No members yet.
          </p>
        ) : (
          members.map((member) => {
            const isSelf = member.id === user.id;

            return (
              <div
                key={member.id}
                className="flex flex-col gap-4 border border-warm-gray/20 p-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-normal text-off-white">
                      {member.name}
                    </h2>
                    <span className="border border-warm-gray/50 px-1.5 py-0.5 text-xs text-off-white/70">
                      {member.role}
                    </span>
                    {isSelf ? (
                      <span className="text-xs text-off-white/40">you</span>
                    ) : null}
                  </div>
                  <p className="text-sm font-normal text-off-white/70">
                    Email (login): {member.email}
                  </p>
                  <p className="text-sm font-normal text-off-white/70">
                    Phone: {member.phone ?? "not added"}
                  </p>
                </div>

                <MemberRoleForm
                  profileId={member.id}
                  currentRole={member.role}
                  locked={isSelf}
                />

                <ResetPasswordForm
                  profileId={member.id}
                  memberName={member.name}
                />

                {!isSelf ? (
                  <form action={deleteMember.bind(null, member.id)}>
                    <ConfirmSubmitButton
                      confirmMessage={`Delete ${member.name}? This permanently removes their account and login. This can't be undone.`}
                      className="text-sm font-normal text-off-white/50 underline underline-offset-4 hover:text-destructive"
                    >
                      Delete user
                    </ConfirmSubmitButton>
                  </form>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
