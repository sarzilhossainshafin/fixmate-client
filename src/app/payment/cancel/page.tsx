"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <section className="min-h-[65vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-base-300 bg-base-100 p-8 text-center shadow-xl">
        <XCircle className="mx-auto mb-5 h-16 w-16 text-warning" />

        <h1 className="mb-3 text-3xl font-bold">
          Payment Cancelled
        </h1>

        <p className="mb-3 text-base-content/70">
          Your payment was not completed.
        </p>

        <p className="mb-8 text-sm text-base-content/60">
          Your booking is still completed, but its payment status remains unpaid.
          You can return to your bookings and try again whenever you are ready.
        </p>

        <Link
          href="/dashboard/customer/bookings"
          className="btn btn-primary"
        >
          Back to My Bookings
        </Link>
      </div>
    </section>
  );
}
