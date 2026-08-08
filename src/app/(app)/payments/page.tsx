import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PaymentChargeRow } from "@/components/admin/payment-charge-row";
import { PaymentForm } from "@/components/admin/payment-form";
import { AddOptionBox } from "@/components/guidance/add-option-box";
import { Avatar } from "@/components/ui/avatar";
import { getPayments } from "@/lib/supabase/payments";
import { getAllProfiles, getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import type { Payment } from "@/types/database";

function formatDate(value: string | null) {
  if (!value) return null;
  try {
    return format(new Date(`${value}T00:00:00`), "MMM d");
  } catch {
    return value;
  }
}

interface MemberLedger {
  profileId: string;
  name: string;
  charges: Payment[];
  owed: number;
  paid: number;
  openCount: number;
}

export default async function PaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  const isStaff = profile?.role === "admin" || profile?.role === "co-admin";

  // Members never pay here — staff ledger only (admin + co-admin).
  if (!isStaff) redirect("/home");

  const [payments, profiles] = await Promise.all([
    getPayments(supabase),
    getAllProfiles(supabase),
  ]);

  const nameById = new Map(profiles.map((p) => [p.id, p.name]));

  const byMember = new Map<string, MemberLedger>();
  for (const payment of payments) {
    const existing = byMember.get(payment.profile_id);
    const name = nameById.get(payment.profile_id) ?? "Member";
    const row =
      existing ??
      ({
        profileId: payment.profile_id,
        name,
        charges: [],
        owed: 0,
        paid: 0,
        openCount: 0,
      } satisfies MemberLedger);

    row.charges.push(payment);
    if (payment.status === "paid") {
      row.paid += payment.amount;
    } else if (payment.status !== "refunded") {
      row.owed += payment.amount;
      row.openCount += 1;
    }
    byMember.set(payment.profile_id, row);
  }

  const members = Array.from(byMember.values()).sort((a, b) => {
    if (a.openCount !== b.openCount) return b.openCount - a.openCount;
    if (a.owed !== b.owed) return b.owed - a.owed;
    return a.name.localeCompare(b.name);
  });

  const totalCharged = payments
    .filter((p) => p.status !== "refunded")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalCollected = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOwed = totalCharged - totalCollected;
  const openCount = payments.filter(
    (p) => p.status === "unpaid" || p.status === "pending"
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="wr-fade-up flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="wr-section-label">Staff only</span>
          <Link
            href="/admin"
            className="text-sm font-medium text-ice underline-offset-4 hover:text-off-white hover:underline"
          >
            ← Dashboard
          </Link>
        </div>
        <h1 className="font-heading text-2xl font-semibold text-off-white md:text-3xl">
          Payment ledger
        </h1>
        <p className="max-w-xl text-sm text-off-white/70">
          Admins and co-admins track who paid outside the app (Venmo, cash,
          etc.). Tap an amount to edit it. Tap Mark paid when money lands.
          Members never see this page.
        </p>
      </header>

      <section className="wr-fade-up grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Still owed" value={`$${totalOwed.toLocaleString()}`} accent />
        <Stat label="Collected" value={`$${totalCollected.toLocaleString()}`} />
        <Stat label="Charged" value={`$${totalCharged.toLocaleString()}`} />
        <Stat
          label="Open"
          value={String(openCount)}
          hint={openCount === 1 ? "charge" : "charges"}
        />
      </section>

      <AddOptionBox label="Add a charge">
        {() => <PaymentForm profiles={profiles} />}
      </AddOptionBox>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <span className="wr-section-label">By member</span>
          <span className="text-xs font-semibold text-ember tabular-nums">
            {members.length}
          </span>
        </div>

        {members.length === 0 ? (
          <p className="wr-hint">
            No charges yet. Add one above — then mark paid when they send it.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {members.map((member) => (
              <article key={member.profileId} className="wr-panel flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={member.name} size="md" />
                    <div className="min-w-0">
                      <h2 className="truncate font-heading text-lg font-semibold text-off-white">
                        {member.name}
                      </h2>
                      <p className="text-xs text-warm-gray">
                        {member.openCount > 0
                          ? `${member.openCount} open`
                          : "All clear"}
                        {member.paid > 0
                          ? ` · $${member.paid.toLocaleString()} paid`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {member.owed > 0 ? (
                      <>
                        <p className="font-heading text-2xl font-semibold text-ember tabular-nums">
                          ${member.owed.toLocaleString()}
                        </p>
                        <p className="text-[11px] font-semibold tracking-wide text-warm-gray uppercase">
                          still owes
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-heading text-2xl font-semibold text-winter-green tabular-nums">
                          $0
                        </p>
                        <p className="text-[11px] font-semibold tracking-wide text-winter-green uppercase">
                          paid up
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <ul className="flex flex-col gap-2">
                  {member.charges.map((payment) => (
                    <PaymentChargeRow
                      key={payment.id}
                      payment={payment}
                      dueLabel={formatDate(payment.due_date)}
                    />
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "wr-panel flex flex-col gap-1 !p-3 " +
        (accent ? "border-ember/40" : "")
      }
    >
      <span className="wr-section-label">{label}</span>
      <span
        className={
          "font-heading text-xl font-semibold tabular-nums " +
          (accent ? "text-ember" : "text-off-white")
        }
      >
        {value}
      </span>
      {hint ? <span className="text-xs text-warm-gray">{hint}</span> : null}
    </div>
  );
}
