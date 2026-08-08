"use client";

import { useActionState, useState } from "react";

import {
  deletePayment,
  setPaymentStatus,
  updateChargeAmount,
  type PaymentFormState,
} from "@/app/(app)/payments/actions";
import { FormNotice } from "@/components/ui/form-notice";
import type { Payment, PaymentStatus } from "@/types/database";

interface PaymentChargeRowProps {
  payment: Payment;
  dueLabel: string | null;
}

const amountInitial: PaymentFormState = {};

function statusTone(status: PaymentStatus) {
  if (status === "paid") {
    return "border-winter-green/70 bg-winter-green/15 text-winter-green";
  }
  if (status === "pending") {
    return "border-ember/60 bg-ember/10 text-ember";
  }
  if (status === "refunded") {
    return "border-warm-gray/40 text-warm-gray";
  }
  return "border-warm-gray/45 text-off-white/80";
}

export function PaymentChargeRow({ payment, dueLabel }: PaymentChargeRowProps) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(payment.amount));
  const [lastSavedAt, setLastSavedAt] = useState<number | undefined>();
  const [state, formAction, isPending] = useActionState(
    updateChargeAmount.bind(null, payment.id),
    amountInitial
  );

  if (state.postedAt && state.postedAt !== lastSavedAt) {
    setLastSavedAt(state.postedAt);
    setEditing(false);
  }

  const isPaid = payment.status === "paid";

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-warm-gray/20 bg-charcoal/30 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-off-white">
              {payment.description}
            </p>
            <span
              className={
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase " +
                statusTone(payment.status)
              }
            >
              {payment.status}
            </span>
            {payment.category ? (
              <span className="text-xs text-warm-gray">{payment.category}</span>
            ) : null}
          </div>
          {dueLabel || payment.notes ? (
            <p className="mt-0.5 text-xs text-warm-gray">
              {[dueLabel ? `Due ${dueLabel}` : null, payment.notes]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
        </div>

        {editing ? (
          <form
            action={formAction}
            className="flex shrink-0 items-center gap-2"
          >
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-warm-gray">
                $
              </span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="wr-input !min-h-9 w-28 !rounded-lg !py-1.5 pl-6 text-sm tabular-nums"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="wr-btn-primary !min-h-9 !px-3 text-xs"
            >
              {isPending ? "..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setAmount(String(payment.amount));
              }}
              className="text-xs text-warm-gray hover:text-off-white"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 text-right font-heading text-xl font-semibold text-ember tabular-nums transition-colors hover:text-off-white"
            title="Edit amount"
          >
            ${Number(payment.amount).toLocaleString()}
          </button>
        )}
      </div>

      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}

      <div className="flex flex-wrap items-center gap-2">
        {!isPaid ? (
          <form action={setPaymentStatus.bind(null, payment.id, "paid")}>
            <button type="submit" className="wr-btn-primary !min-h-9 !px-3.5 text-xs">
              Mark paid
            </button>
          </form>
        ) : (
          <form action={setPaymentStatus.bind(null, payment.id, "unpaid")}>
            <button type="submit" className="wr-btn !min-h-9 !px-3.5 text-xs">
              Mark unpaid
            </button>
          </form>
        )}
        {payment.status !== "pending" && !isPaid ? (
          <form action={setPaymentStatus.bind(null, payment.id, "pending")}>
            <button type="submit" className="wr-btn !min-h-9 !px-3 text-xs">
              Pending
            </button>
          </form>
        ) : null}
        <form action={deletePayment.bind(null, payment.id)} className="ml-auto">
          <button
            type="submit"
            className="text-xs font-medium text-warm-gray hover:text-off-white"
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
