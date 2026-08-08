"use client";

import { useActionState } from "react";

import {
  updateMemberRole,
  type MemberRoleState,
} from "@/app/(app)/admin/members/actions";
import { FormNotice } from "@/components/ui/form-notice";
import { MEMBER_ROLES } from "@/lib/validations/member";
import type { UserRole } from "@/types/database";

interface MemberRoleFormProps {
  profileId: string;
  currentRole: UserRole;
  locked?: boolean;
}

const initialState: MemberRoleState = {};

export function MemberRoleForm({
  profileId,
  currentRole,
  locked,
}: MemberRoleFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateMemberRole.bind(null, profileId),
    initialState
  );

  if (locked) {
    return (
      <p className="text-sm font-normal text-off-white/50">
        Your role stays admin (can&apos;t demote yourself).
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`role-${profileId}`}
          className="text-xs font-normal text-off-white/50"
        >
          Role
        </label>
        <select
          id={`role-${profileId}`}
          name="role"
          defaultValue={currentRole}
          className="border border-warm-gray/40 bg-charcoal px-3 py-2 text-sm text-off-white outline-none focus:border-off-white"
        >
          {MEMBER_ROLES.map((role) => (
            <option key={role} value={role} className="bg-charcoal">
              {role}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="border border-warm-gray/40 px-3 py-2 text-sm font-normal text-off-white hover:border-off-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Update role"}
      </button>
      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}
      {state.success ? (
        <FormNotice tone="success">Role updated.</FormNotice>
      ) : null}
    </form>
  );
}
