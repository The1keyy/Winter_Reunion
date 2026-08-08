import { format } from "date-fns";
import { redirect } from "next/navigation";

import {
  deletePayment,
  setPaymentStatus,
} from "@/app/(app)/payments/actions";
import { PaymentForm } from "@/components/admin/payment-form";
import { getPayments } from "@/lib/supabase/payments";
import { getAllProfiles, getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/types/database";

const STATUS_OPTIONS: PaymentStatus[] = ["unpaid", "pending", "paid", "refunded"];

function formatDate(value: string | null) {
  if (!value) return null;
  try {
    return format(new Date(`${value}T00:00:00`), "MMM d, yyyy");
  } catch {
    return value;
  }
}

export default async function PaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(supabase, user.id);
  const isAdmin = profile?.role === "admin" || profile?.role === "co-admin";

  // Money stays out of the member app — Key collects outside (Venmo, etc.).
  if (!isAdmin) {
    redirect("/home");
  }

  const [payments, profiles] = await Promise.all([
    getPayments(supabase),
    getAllProfiles(supabase),
  ]);

  const profileNameById = new Map(profiles.map((p) => [p.id, p.name]));

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          Payments
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          Admin ledger only — track who&apos;s paid. Members never see this or
          pay in the app.
        </p>
      </div>

      <div className="flex flex-col gap-4 border-b border-warm-gray/20 pb-8">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          Add a charge
        </span>
        <PaymentForm profiles={profiles} />
      </div>

      <div className="flex flex-col gap-4">
        {payments.length === 0 ? (
          <p className="text-sm font-normal text-off-white/60">
            No charges yet.
          </p>
        ) : (
          payments.map((payment) => {
            const dueLabel = formatDate(payment.due_date);
            const memberName = profileNameById.get(payment.profile_id);

            return (
              <div
                key={payment.id}
                className="flex flex-col gap-2 border border-warm-gray/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-normal text-off-white">
                        {payment.description}
                      </h2>
                      {payment.category ? (
                        <span className="border border-warm-gray/50 px-1.5 py-0.5 text-xs text-off-white/70">
                          {payment.category}
                        </span>
                      ) : null}
                      <span
                        className={
                          "border px-1.5 py-0.5 text-xs " +
                          (payment.status === "paid"
                            ? "border-winter-green text-winter-green"
                            : payment.status === "refunded"
                              ? "border-warm-gray/50 text-off-white/40"
                              : "border-warm-gray/50 text-off-white/70")
                        }
                      >
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-sm font-normal text-off-white/60">
                      {[memberName, dueLabel ? `Due ${dueLabel}` : null]
                        .filter(Boolean)
                        .join(" \u00b7 ")}
                    </p>
                    {payment.notes ? (
                      <p className="text-sm font-normal whitespace-pre-wrap text-off-white/70">
                        {payment.notes}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-lg font-light text-off-white">
                    ${payment.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-warm-gray/20 pt-3">
                  {STATUS_OPTIONS.filter(
                    (status) => status !== payment.status
                  ).map((status) => (
                    <form
                      key={status}
                      action={setPaymentStatus.bind(null, payment.id, status)}
                    >
                      <button
                        type="submit"
                        className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                      >
                        Mark {status}
                      </button>
                    </form>
                  ))}
                  <form action={deletePayment.bind(null, payment.id)}>
                    <button
                      type="submit"
                      className="text-sm font-normal text-off-white/50 hover:text-off-white"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
