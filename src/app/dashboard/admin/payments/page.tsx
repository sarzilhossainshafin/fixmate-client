
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  CalendarDays,
  Receipt,
  User,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";

interface AdminPayment {
  _id: string;
  bookingId?: string;
  customerEmail?: string;
  technicianName?: string;
  technicianEmail?: string;
  serviceTitle?: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  stripeSessionId?: string;
  paymentStatus?: string;
  paidAt?: string;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    const role = (session.user as { role?: string }).role;

    if (role !== "admin") {
      router.replace(
        role === "technician"
          ? "/dashboard/technician/requests"
          : "/dashboard/customer"
      );
      return;
    }

    let active = true;

    const fetchPayments = async () => {
      try {
        const response = await api.get("/admin/payments");

        if (active) {
          setPayments(response.data.payments || []);
        }
      } catch (error) {
        console.error("Admin payments error:", error);
        if (active) toast.error("Failed to load payments.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPayments();

    return () => {
      active = false;
    };
  }, [session, isPending, router]);

  const refreshPayments = async () => {
    setRefreshing(true);

    try {
      const response = await api.get("/admin/payments");
      setPayments(response.data.payments || []);
      toast.success("Payments refreshed.");
    } catch (error) {
      console.error("Refresh payments error:", error);
      toast.error("Failed to refresh payments.");
    } finally {
      setRefreshing(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const query = search.toLowerCase();

    return payments.filter((payment) =>
      [
        payment.serviceTitle,
        payment.customerEmail,
        payment.technicianName,
        payment.technicianEmail,
        payment.bookingId,
        payment.transactionId,
        payment.stripeSessionId,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [payments, search]);

  const totalRevenue = payments
    .filter((payment) => payment.paymentStatus === "paid")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const formatDate = (date?: string) => {
    if (!date) return "Not available";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "Not available"
      : parsed.toLocaleString("en-BD", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Administration
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Payment Records
            </h1>
            <p className="mt-2 text-slate-500">
              Monitor transactions and platform revenue.
            </p>
          </div>

          <button
            onClick={refreshPayments}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
              <CreditCard size={20} />
              <p className="text-sm font-semibold">Successful Payments</p>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {payments.filter((p) => p.paymentStatus === "paid").length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
              <Receipt size={20} />
              <p className="text-sm font-semibold">Total Revenue</p>
            </div>
            <p className="mt-3 text-3xl font-black text-green-600">
              ৳{totalRevenue.toLocaleString("en-BD")}
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={19}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, service, booking or transaction ID..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-red-500"
          />
        </div>

        {filteredPayments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <CreditCard
              className="mx-auto mb-4 text-slate-400"
              size={42}
            />
            <h2 className="text-xl font-bold text-slate-800">
              No payment records found
            </h2>
            <p className="mt-2 text-slate-500">
              Payment records will appear here after successful transactions.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-slate-900">
                All Transactions ({filteredPayments.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => (
                <article
                  key={payment._id}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Wrench size={17} className="shrink-0 text-red-600" />
                        <h3 className="font-bold text-slate-900">
                          {payment.serviceTitle || "Repair Service"}
                        </h3>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Customer
                          </p>
                          <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-700">
                            <User size={14} className="shrink-0" />
                            {payment.customerEmail || "Unknown"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Technician
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            {payment.technicianName || "Unknown"}
                          </p>
                          <p className="break-all text-xs text-slate-500">
                            {payment.technicianEmail}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-500">
                        <p className="break-all">
                          Booking ID: {payment.bookingId || "N/A"}
                        </p>
                        <p className="break-all">
                          Transaction ID: {payment.transactionId || "N/A"}
                        </p>
                        <p className="break-all">
                          Stripe Session: {payment.stripeSessionId || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 md:min-w-40 md:text-right">
                      <p className="text-2xl font-black text-slate-900">
                        ৳{Number(payment.amount || 0).toLocaleString("en-BD")}
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                          payment.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {payment.paymentStatus || "Unknown"}
                      </span>

                      <p className="mt-3 flex items-center gap-1 text-xs text-slate-500 md:justify-end">
                        <CalendarDays size={13} />
                        {formatDate(payment.paidAt)}
                      </p>

                      <p className="mt-1 text-xs uppercase text-slate-400">
                        {payment.currency || "BDT"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
