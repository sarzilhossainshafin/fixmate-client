
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
  Loader2,
  MapPin,
  RefreshCw,
  XCircle,
  Wrench,
  Ban,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { authClient } from "@/lib/auth-client";

type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

type Booking = {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  category: string;
  basePrice: number;
  finalAmount: number;
  technicianName: string;
  customerName: string;
  address: string;
  preferredDate: string;
  problemDescription?: string;
  status: BookingStatus;
  paymentStatus: "paid" | "unpaid";
  createdAt: string;
};

const filters = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export default function CustomerBookingsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const loadBookings = useCallback(async () => {
    try {
      const response = await api.get("/bookings/my");

      if (response.data?.success) {
        setBookings(response.data.bookings || []);
      } else {
        toast.error("Failed to load your bookings.");
      }
    } catch (error) {
      console.error("Customer bookings error:", error);
      toast.error("Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      window.location.href = "/sign-in";
      return;
    }

    const role = (session.user as { role?: string }).role;

    if (role !== "customer") {
      window.location.href = "/";
      return;
    }

    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        void loadBookings();
      }
    });

    return () => {
      active = false;
    };
  }, [isPending, session, loadBookings]);

  const handleRefresh = async () => {
    setLoading(true);
    await loadBookings();
  };

  const handleCancel = async (bookingId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setCancellingId(bookingId);

    try {
      const response = await api.patch(
        `/bookings/${bookingId}/cancel`
      );

      if (response.data?.success) {
        toast.success("Booking cancelled successfully.");
        await loadBookings();
      } else {
        toast.error(
          response.data?.message || "Unable to cancel booking."
        );
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error("Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  // Start Stripe Checkout
  const handlePayNow = async (bookingId: string) => {
    setPayingId(bookingId);

    try {
      const response = await api.post(
        "/payments/create-checkout-session",
        { bookingId }
      );

      if (
        response.data?.success &&
        response.data?.checkoutUrl
      ) {
        window.location.href = response.data.checkoutUrl;
        return;
      }

      toast.error(
        response.data?.message || "Unable to start payment."
      );
    } catch (error) {
      console.error("Payment checkout error:", error);
      toast.error(
        "Failed to start payment. Please try again."
      );
    } finally {
      setPayingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookings;

    return bookings.filter(
      (booking) => booking.status === activeFilter
    );
  }, [bookings, activeFilter]);

  const formatDate = (date: string) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (amount: number) => {
    return `৳${(amount || 0).toLocaleString("en-BD")}`;
  };

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case "requested":
        return "bg-amber-50 text-amber-700";
      case "accepted":
        return "bg-blue-50 text-blue-700";
      case "in-progress":
        return "bg-violet-50 text-violet-700";
      case "completed":
        return "bg-emerald-50 text-emerald-700";
      case "rejected":
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold">Please sign in</h2>
        <Link href="/sign-in" className="btn-primary mt-5">
          Sign In
        </Link>
      </div>
    );
  }

  const user = session.user as { role?: string };

  if (user.role !== "customer") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="mt-2 text-sm text-slate-500">
          This page is only available to customers.
        </p>
        <Link href="/" className="btn-primary mt-5">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-8">
          <Link
            href="/dashboard/customer"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-teal-700">
                Customer Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                My Bookings
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Track and manage all your repair service requests.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-outline"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <Link href="/services" className="btn-primary">
                <Wrench size={16} />
                Book a Service
              </Link>
            </div>
          </div>
        </div>

        {/* Booking statistics */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Bookings",
              value: bookings.length,
              icon: ClipboardList,
              color: "bg-teal-50 text-teal-700",
            },
            {
              label: "Pending",
              value: bookings.filter(
                (b) => b.status === "requested"
              ).length,
              icon: Clock,
              color: "bg-amber-50 text-amber-700",
            },
            {
              label: "Active Repairs",
              value: bookings.filter(
                (b) =>
                  b.status === "accepted" ||
                  b.status === "in-progress"
              ).length,
              icon: Wrench,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Completed",
              value: bookings.filter(
                (b) => b.status === "completed"
              ).length,
              icon: CheckCircle2,
              color: "bg-emerald-50 text-emerald-700",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-500 sm:text-sm">
                    {stat.label}
                  </p>
                  <span className={`rounded-xl p-2.5 ${stat.color}`}>
                    <Icon size={19} />
                  </span>
                </div>

                <p className="mt-3 text-2xl font-extrabold text-slate-900">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex min-w-max gap-2">
            {filters.map((filter) => {
              const count =
                filter.value === "all"
                  ? bookings.length
                  : bookings.filter(
                      (booking) =>
                        booking.status === filter.value
                    ).length;

              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    activeFilter === filter.value
                      ? "bg-teal-700 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-800"
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 opacity-75">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking list */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            {bookings.length === 0 ? (
              <>
                <ClipboardList className="mx-auto mb-4 h-14 w-14 text-slate-300" />

                <h2 className="text-xl font-extrabold text-slate-900">
                  No bookings yet
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  You have not booked any repair services yet.
                </p>

                <Link href="/services" className="btn-primary mt-6">
                  Browse Services
                </Link>
              </>
            ) : (
              <>
                <XCircle className="mx-auto mb-4 h-12 w-12 text-slate-300" />

                <h2 className="text-lg font-extrabold text-slate-900">
                  No matching bookings
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  There are no bookings with this status.
                </p>

                <button
                  onClick={() => setActiveFilter("all")}
                  className="btn-primary mt-5"
                >
                  Show All Bookings
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => (
              <article
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row">

                  {/* Service image */}
                  <div className="h-44 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-44">
                    {booking.serviceImage ? (
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Wrench className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Booking details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-extrabold text-slate-900">
                        {booking.serviceTitle}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace("-", " ")}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-teal-700">
                      {booking.category}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <p className="flex items-start gap-2 text-slate-600">
                        <CalendarDays
                          size={16}
                          className="mt-0.5 shrink-0 text-teal-700"
                        />
                        <span>
                          <span className="font-semibold text-slate-800">
                            Preferred Date:
                          </span>
                          <br />
                          {formatDate(booking.preferredDate)}
                        </span>
                      </p>

                      <p className="flex items-start gap-2 text-slate-600">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-teal-700"
                        />
                        <span>
                          <span className="font-semibold text-slate-800">
                            Service Address:
                          </span>
                          <br />
                          {booking.address}
                        </span>
                      </p>

                      <p className="flex items-start gap-2 text-slate-600">
                        <Wrench
                          size={16}
                          className="mt-0.5 shrink-0 text-teal-700"
                        />
                        <span>
                          <span className="font-semibold text-slate-800">
                            Technician:
                          </span>
                          <br />
                          {booking.technicianName || "Not assigned"}
                        </span>
                      </p>

                      <p className="flex items-start gap-2 text-slate-600">
                        <ClipboardList
                          size={16}
                          className="mt-0.5 shrink-0 text-teal-700"
                        />
                        <span>
                          <span className="font-semibold text-slate-800">
                            Booking ID:
                          </span>
                          <br />
                          <span className="break-all text-xs">
                            {booking._id}
                          </span>
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Price and actions */}
                  <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:justify-between lg:w-48 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <div className="lg:text-right">
                      <p className="text-xs font-semibold text-slate-400">
                        {booking.status === "completed"
                          ? "Final Amount"
                          : "Estimated Amount"}
                      </p>

                      <p className="mt-1 text-2xl font-extrabold text-slate-900">
                        {formatPrice(
                          booking.finalAmount || booking.basePrice
                        )}
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${
                          booking.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {booking.paymentStatus === "paid"
                          ? "Paid"
                          : "Unpaid"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Cancel booking */}
                      {booking.status === "requested" && (
                        <button
                          onClick={() =>
                            void handleCancel(booking._id)
                          }
                          disabled={cancellingId === booking._id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {cancellingId === booking._id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Ban size={15} />
                          )}
                          Cancel Booking
                        </button>
                      )}

                      {/* Pay Now */}
                      {booking.status === "completed" &&
                        booking.paymentStatus === "unpaid" && (
                          <button
                            onClick={() =>
                              void handlePayNow(booking._id)
                            }
                            disabled={payingId === booking._id}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {payingId === booking._id ? (
                              <>
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard size={16} />
                                Pay Now
                              </>
                            )}
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom navigation */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard/customer"
            className="btn-outline"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

          <Link
            href="/dashboard/customer/payments"
            className="btn-outline"
          >
            Payment History
          </Link>
        </div>
      </div>
    </section>
  );
}
