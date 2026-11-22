
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  MapPin,
  Phone,
  CalendarDays,
  User,
  Wrench,
  Banknote,
  Inbox,
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
  serviceId: string;
  serviceTitle: string;
  serviceImage?: string;
  category: string;
  basePrice: number;
  finalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  paymentStatus: "paid" | "unpaid";
  createdAt: string;
};

const filters = [
  { label: "All Requests", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export default function TechnicianRequestsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [finalAmounts, setFinalAmounts] = useState<
    Record<string, string>
  >({});

  const loadBookings = useCallback(async () => {
    try {
      const response = await api.get("/bookings/technician");

      if (response.data?.success) {
        setBookings(response.data.bookings || []);
      } else {
        toast.error("Failed to load booking requests.");
      }
    } catch (error) {
      console.error("Load technician bookings error:", error);
      toast.error("Unable to load booking requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Authentication and role check
  useEffect(() => {
    if (isPending) return;

    if (!session) {
      window.location.href = "/sign-in";
      return;
    }

    const role = (session.user as { role?: string }).role;

    if (role !== "technician") {
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

  // Update booking status
  const handleStatusUpdate = async (
    booking: Booking,
    status: BookingStatus
  ) => {
    if (status === "rejected") {
      const confirmed = window.confirm(
        "Are you sure you want to reject this booking request?"
      );

      if (!confirmed) return;
    }
const payload: {
  status: BookingStatus;
  finalAmount?: number;
} = { status };

    if (status === "completed") {
      const amount = Number(finalAmounts[booking._id]);

      if (
        !finalAmounts[booking._id]?.trim() ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        toast.error("Please enter a valid final amount.");
        return;
      }

      payload.finalAmount = amount;
    }

    try {
      setActionId(booking._id);

      const response = await api.patch(
        `/bookings/${booking._id}/status`,
        payload
      );

      if (response.data?.success) {
        toast.success(response.data.message || "Booking updated.");

        await loadBookings();
      } else {
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      console.error("Update booking status error:", error);
      toast.error("Failed to update booking status.");
    } finally {
      setActionId(null);
    }
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

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

  const formatDate = (date: string) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (amount: number) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Wrench className="mb-4 h-10 w-10 text-teal-700" />
        <h2 className="text-xl font-bold">Please sign in</h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to manage your booking requests.
        </p>
        <Link href="/sign-in" className="btn-primary mt-5">
          Sign In
        </Link>
      </div>
    );
  }

  const userRole = (session.user as { role?: string }).role;

  if (userRole !== "technician") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Wrench className="mb-4 h-10 w-10 text-red-500" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="mt-2 text-sm text-slate-500">
          This page is only available to technicians.
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
        {/* Back link */}
        <Link
          href="/dashboard/technician/my-services"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"
        >
          <ArrowLeft size={17} />
          Back to My Services
        </Link>

        {/* Heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-teal-700">
              Technician Dashboard
            </span>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Booking Requests
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              Manage customer requests and track your repair jobs.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-outline"
          >
            <RefreshCw size={16} />
            Refresh Requests
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Requests",
              value: bookings.length,
              color: "text-slate-900",
            },
            {
              label: "New Requests",
              value: bookings.filter(
                (b) => b.status === "requested"
              ).length,
              color: "text-amber-700",
            },
            {
              label: "Active Jobs",
              value: bookings.filter(
                (b) =>
                  b.status === "accepted" ||
                  b.status === "in-progress"
              ).length,
              color: "text-blue-700",
            },
            {
              label: "Completed",
              value: bookings.filter(
                (b) => b.status === "completed"
              ).length,
              color: "text-emerald-700",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold text-slate-500">
                {stat.label}
              </p>
              <p className={`mt-2 text-3xl font-extrabold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                filter === item.value
                  ? "bg-teal-700 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-teal-600 hover:text-teal-700"
              }`}
            >
              {item.label}
              {item.value === "all"
                ? ` (${bookings.length})`
                : ` (${
                    bookings.filter(
                      (booking) => booking.status === item.value
                    ).length
                  })`}
            </button>
          ))}
        </div>

        {/* Booking list */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <Inbox className="mx-auto mb-4 h-12 w-12 text-slate-300" />

            <h2 className="text-xl font-bold text-slate-800">
              {bookings.length === 0
                ? "No booking requests yet"
                : "No bookings in this category"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {bookings.length === 0
                ? "Customer booking requests will appear here."
                : "Try selecting another status filter."}
            </p>

            <button
              onClick={handleRefresh}
              className="btn-primary mt-6"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <article
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row">
                  {/* Service image */}
                  <div className="h-48 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-40 sm:w-52">
                    {booking.serviceImage ? (
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Wrench className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Booking information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                        {booking.category}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace("-", " ")}
                      </span>
                    </div>

                    <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                      {booking.serviceTitle}
                    </h2>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      Booking price: {formatPrice(booking.basePrice)}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <p className="flex items-center gap-2">
                        <User size={16} className="shrink-0 text-teal-700" />
                        {booking.customerName}
                      </p>

                      <p className="flex items-center gap-2">
                        <Phone size={16} className="shrink-0 text-teal-700" />
                        {booking.customerPhone}
                      </p>

                      <p className="flex items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-teal-700"
                        />
                        {formatDate(booking.preferredDate)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Clock size={16} className="shrink-0 text-teal-700" />
                        Requested: {formatDate(booking.createdAt)}
                      </p>

                      <p className="flex items-start gap-2 sm:col-span-2">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-teal-700"
                        />
                        {booking.address}
                      </p>
                    </div>

                    {/* Problem description */}
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Customer Problem
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {booking.problemDescription}
                      </p>
                    </div>

                    {/* Payment information */}
                    {booking.status === "completed" && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-bold text-slate-700">
                          Final amount: {formatPrice(booking.finalAmount)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            booking.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          Payment: {booking.paymentStatus}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                      {booking.status === "requested" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking, "accepted")
                            }
                            disabled={actionId === booking._id}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {actionId === booking._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                            Accept Request
                          </button>

                          <button
                            onClick={() =>
                              handleStatusUpdate(booking, "rejected")
                            }
                            disabled={actionId === booking._id}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      )}

                      {booking.status === "accepted" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking, "in-progress")
                          }
                          disabled={actionId === booking._id}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          {actionId === booking._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <PlayCircle size={16} />
                          )}
                          Start Work
                        </button>
                      )}

                      {booking.status === "in-progress" && (
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
                          <div className="w-full sm:max-w-xs">
                            <label
                              htmlFor={`amount-${booking._id}`}
                              className="mb-2 block text-xs font-bold text-slate-600"
                            >
                              Final Amount (BDT)
                            </label>

                            <div className="relative">
                              <Banknote
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />

                              <input
                                id={`amount-${booking._id}`}
                                type="number"
                                min="1"
                                step="1"
                                placeholder="Enter final amount"
                                value={finalAmounts[booking._id] || ""}
                                onChange={(event) =>
                                  setFinalAmounts((prev) => ({
                                    ...prev,
                                    [booking._id]: event.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleStatusUpdate(booking, "completed")
                            }
                            disabled={actionId === booking._id}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {actionId === booking._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                            Complete Job
                          </button>
                        </div>
                      )}

                      {(booking.status === "completed" ||
                        booking.status === "rejected" ||
                        booking.status === "cancelled") && (
                        <p className="text-sm font-semibold text-slate-400">
                          No further actions available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
