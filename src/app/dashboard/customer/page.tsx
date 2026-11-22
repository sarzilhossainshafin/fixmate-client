
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Clock,
  CheckCircle2,
  Wrench,
  ArrowRight,
  Loader2,
  RefreshCw,
  MapPin,
  Banknote,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { authClient } from "@/lib/auth-client";

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
  status:
    | "requested"
    | "accepted"
    | "rejected"
    | "in-progress"
    | "completed"
    | "cancelled";
  paymentStatus: "paid" | "unpaid";
  createdAt: string;
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    try {
      const response = await api.get("/bookings/my");

      if (response.data?.success) {
        setBookings(response.data.bookings || []);
      } else {
        toast.error("Failed to load your bookings.");
      }
    } catch (error) {
      console.error("Customer dashboard error:", error);
      toast.error("Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Authentication and role check
  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.push("/sign-in");
      return;
    }

    const role = (session.user as { role?: string }).role;

    if (role !== "customer") {
      router.push("/");
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
  }, [isPending, session, loadBookings, router]);

  const handleRefresh = async () => {
    setLoading(true);
    await loadBookings();
  };

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

  const getStatusStyle = (status: Booking["status"]) => {
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

  const user = session.user as {
    name?: string;
    role?: string;
  };

  if (user.role !== "customer") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="mt-2 text-sm text-slate-500">
          This dashboard is only available to customers.
        </p>
        <Link href="/" className="btn-primary mt-5">
          Back to Home
        </Link>
      </div>
    );
  }

  const requestedCount = bookings.filter(
    (booking) => booking.status === "requested"
  ).length;

  const activeCount = bookings.filter(
    (booking) =>
      booking.status === "accepted" ||
      booking.status === "in-progress"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  const recentBookings = bookings.slice(0, 5);

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Welcome section */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-linear-to-r from-teal-800 to-teal-600 p-7 text-white shadow-lg sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-teal-100">
                Customer Dashboard
              </p>

              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Welcome, {user.name || "Customer"}!
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50">
                Track your repair requests, monitor job progress and manage
                your service bookings from one place.
              </p>
            </div>

            <Link
              href="/services"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-teal-800 transition hover:bg-teal-50"
            >
              <Plus size={18} />
              Book a Service
            </Link>
          </div>
        </div>

        {/* Heading and refresh */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Dashboard Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Here is your repair activity at a glance.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-outline"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Bookings",
              value: bookings.length,
              icon: ClipboardList,
              color: "bg-teal-50 text-teal-700",
            },
            {
              label: "Pending Requests",
              value: requestedCount,
              icon: Clock,
              color: "bg-amber-50 text-amber-700",
            },
            {
              label: "Active Repairs",
              value: activeCount,
              icon: Wrench,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Completed Jobs",
              value: completedCount,
              icon: CheckCircle2,
              color: "bg-emerald-50 text-emerald-700",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    {stat.label}
                  </p>
                  <span className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={21} />
                  </span>
                </div>

                <p className="mt-4 text-3xl font-extrabold text-slate-900">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="mb-10 grid gap-5 md:grid-cols-2">
          <Link
            href="/dashboard/customer/bookings"
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-teal-50 p-3 text-teal-700">
                <CalendarDays size={24} />
              </span>
              <div>
                <h3 className="font-extrabold text-slate-900">
                  My Bookings
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  View and manage your repair requests.
                </p>
              </div>
            </div>
            <ArrowRight
              size={20}
              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700"
            />
          </Link>

          <Link
            href="/dashboard/customer/payments"
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <Banknote size={24} />
              </span>
              <div>
                <h3 className="font-extrabold text-slate-900">
                  Payment History
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Check your repair payment records.
                </p>
              </div>
            </div>
            <ArrowRight
              size={20}
              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700"
            />
          </Link>
        </div>

        {/* Recent bookings */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Recent Bookings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest repair service requests.
              </p>
            </div>

            <Link
              href="/dashboard/customer/bookings"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <ClipboardList className="mx-auto mb-4 h-12 w-12 text-slate-300" />

              <h3 className="text-lg font-bold text-slate-800">
                No bookings yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Find a repair service and book your first appointment.
              </p>

              <Link href="/services" className="btn-primary mt-6">
                Browse Services
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {booking.serviceImage ? (
                        <Image
                          src={booking.serviceImage}
                          alt={booking.serviceTitle}
                          fill
                          sizes="64px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Wrench className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-extrabold text-slate-900">
                        {booking.serviceTitle}
                      </h3>

                      <p className="mt-1 text-xs font-semibold text-teal-700">
                        {booking.category}
                      </p>

                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} />
                        <span className="truncate">{booking.address}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                    <div>
                      <p className="text-xs text-slate-400">
                        Preferred Date
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatDate(booking.preferredDate)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status.replace("-", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
