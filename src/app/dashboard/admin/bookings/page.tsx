
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  Wrench,
  User,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";

interface AdminBooking {
  _id: string;
  serviceTitle?: string;
  category?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  technicianName?: string;
  technicianEmail?: string;
  address?: string;
  preferredDate?: string;
  problemDescription?: string;
  status: string;
  paymentStatus?: string;
  basePrice?: number;
  finalAmount?: number;
  createdAt?: string;
}

const statusStyles: Record<string, string> = {
  requested: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  "in-progress": "bg-violet-100 text-violet-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-200 text-slate-700",
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadBookings = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const response = await api.get("/admin/bookings");
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Admin bookings error:", error);
      toast.error("Failed to load bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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

    const fetchBookings = async () => {
      try {
        const response = await api.get("/admin/bookings");
        if (active) setBookings(response.data.bookings || []);
      } catch (error) {
        console.error("Admin bookings error:", error);
        if (active) toast.error("Failed to load bookings.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBookings();

    return () => {
      active = false;
    };
  }, [session, isPending, router]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchText = [
        booking.serviceTitle,
        booking.customerName,
        booking.customerEmail,
        booking.technicianName,
        booking.technicianEmail,
        booking._id,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" || booking.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [bookings, search, filter]);

  const counts = {
    all: bookings.length,
    requested: bookings.filter((b) => b.status === "requested").length,
    active: bookings.filter((b) =>
      ["accepted", "in-progress"].includes(b.status)
    ).length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not specified";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? "Not specified"
      : parsed.toLocaleDateString("en-BD", {
          day: "numeric",
          month: "short",
          year: "numeric",
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
              All Bookings
            </h1>
            <p className="mt-2 text-slate-500">
              Monitor customer repair requests and job progress.
            </p>
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              loadBookings(false);
            }}
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

        <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Bookings", value: counts.all },
            { label: "New Requests", value: counts.requested },
            { label: "Active Jobs", value: counts.active },
            { label: "Completed", value: counts.completed },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={19}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search service, customer, technician or ID..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-red-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium outline-none focus:border-red-500"
          >
            <option value="all">All Statuses</option>
            <option value="requested">Requested</option>
            <option value="accepted">Accepted</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <CalendarDays className="mx-auto mb-4 text-slate-400" size={42} />
            <h2 className="text-xl font-bold text-slate-800">
              No bookings found
            </h2>
            <p className="mt-2 text-slate-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredBookings.map((booking) => (
              <article
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Booking ID
                    </p>
                    <p className="mt-1 break-all text-sm font-bold text-slate-700">
                      {booking._id}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      statusStyles[booking.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {booking.status.replace("-", " ")}
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <div className="flex items-center gap-2 text-red-600">
                      <Wrench size={17} />
                      <h2 className="font-bold text-slate-900">
                        {booking.serviceTitle || "Repair Service"}
                      </h2>
                    </div>
                    <p className="ml-6 mt-1 text-sm text-slate-500">
                      {booking.category || "General"}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase text-slate-400">
                        Customer
                      </p>
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <User size={15} />
                        {booking.customerName || "Unknown"}
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {booking.customerEmail}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {booking.customerPhone}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-bold uppercase text-slate-400">
                        Technician
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {booking.technicianName || "Not assigned"}
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {booking.technicianEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    <span>{booking.address || "No address provided"}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={15} />
                      {formatDate(booking.preferredDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={15} />
                      Created: {formatDate(booking.createdAt)}
                    </span>
                  </div>

                  {booking.problemDescription && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Problem Description
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {booking.problemDescription}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-400">Final Amount</p>
                      <p className="text-lg font-black text-slate-900">
                        ৳{Number(
                          booking.finalAmount ?? booking.basePrice ?? 0
                        ).toLocaleString("en-BD")}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        booking.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      Payment: {booking.paymentStatus || "unpaid"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
