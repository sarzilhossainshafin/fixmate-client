
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Receipt,
  ShieldCheck,
  Wallet,
  Wrench,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";


type Payment = {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  amount: number;
  currency: string;
  transactionId: string;
  paymentStatus: string;
  paidAt: string;
};

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    try {
      const response = await api.get("/payments/my");

      if (response.data?.success) {
        setPayments(response.data.payments || []);
      } else {
        toast.error("Failed to load payment history.");
      }
    } catch (error) {
      console.error("Payment history error:", error);
      toast.error("Unable to load payment history.");
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  let isMounted = true;

  const fetchPayments = async () => {
    try {
      const response = await api.get("/payments/my");

      if (isMounted && response.data?.success) {
        setPayments(response.data.payments || []);
      }
    } catch (error) {
      console.error("Payment history error:", error);

      if (isMounted) {
        toast.error("Unable to load payment history.");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchPayments();

  return () => {
    isMounted = false;
  };
}, []);
  const totalPaid = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const formatAmount = (amount: number) =>
    `৳${Number(amount).toLocaleString("en-BD")}`;

  const formatDate = (date: string) =>
    date
      ? new Date(date).toLocaleDateString("en-BD", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  return (
    <section className="min-h-screen bg-base-200 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard/customer"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-neutral p-7 text-neutral-content shadow-xl sm:p-10">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <Receipt size={14} />
                Transaction Records
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Payment History
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-content/65 sm:text-base">
                Keep track of your repair service payments and transaction
                records in one place.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
              <Wallet size={32} />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-9 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/55">
                  Total Amount Paid
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight">
                  {formatAmount(totalPaid)}
                </h2>

                <p className="mt-2 text-xs text-base-content/45">
                  Across all successful payments
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/55">
                  Successful Transactions
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight">
                  {payments.length.toString().padStart(2, "0")}
                </h2>

                <p className="mt-2 text-xs text-base-content/45">
                  Verified payment records
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              Recent Transactions
            </h2>

            <p className="mt-1 text-sm text-base-content/50">
              Your complete payment records
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-2 text-xs font-semibold text-base-content/60">
            <ShieldCheck size={15} className="text-success" />
            Secure Payments
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-base-300 bg-base-100">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-9 w-9 animate-spin text-primary" />

              <p className="text-sm text-base-content/50">
                Loading your transactions...
              </p>
            </div>
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-3xl border border-base-300 bg-base-100 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Receipt size={36} />
            </div>

            <h2 className="text-2xl font-bold">No Payments Yet</h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-base-content/55">
              Your successful repair service payments will appear here once
              you complete a payment.
            </p>

            <Link
              href="/dashboard/customer/bookings"
              className="btn btn-primary mt-7"
            >
              View My Bookings
              <ArrowUpRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <article
                key={payment._id}
                className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-content">
                      <Wrench size={23} />
                    </div>

                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-base-content/40">
                        Transaction #{String(index + 1).padStart(3, "0")}
                      </p>

                      <h3 className="truncate text-lg font-bold">
                        {payment.serviceTitle || "Repair Service"}
                      </h3>

                      <p className="mt-1 text-xs text-base-content/50">
                        Booking ID:{" "}
                        <span className="font-mono">
                          {payment.bookingId?.slice(-8) || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-base-200 pt-4 sm:border-0 sm:pt-0">
                    <div className="sm:text-right">
                      <p className="text-xs font-medium text-base-content/45">
                        Amount Paid
                      </p>

                      <p className="mt-1 text-2xl font-black tracking-tight">
                        {formatAmount(payment.amount)}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-success">
                      <CheckCircle2 size={14} />
                      {payment.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 border-t border-base-200 pt-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-xs text-base-content/55">
                    <CalendarDays size={15} className="shrink-0 text-primary" />
                    <span>Paid on: {formatDate(payment.paidAt)}</span>
                  </div>

                  <div className="min-w-0 text-xs text-base-content/55 sm:text-right">
                    <span className="font-semibold">Transaction ID: </span>

                    <span className="break-all font-mono">
                      {payment.transactionId || "N/A"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/dashboard/customer/bookings"
            className="btn btn-outline btn-sm gap-2"
          >
            View My Bookings
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
