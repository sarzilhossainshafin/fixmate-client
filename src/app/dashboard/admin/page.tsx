
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserRound,
  Wrench,
  ClipboardList,
  CreditCard,
  Clock,
  CheckCircle2,
  RefreshCw,
  LayoutDashboard,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";

interface AdminStats {
  totalUsers: number;
  totalTechnicians: number;
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  approvedServices: number;
  totalBookings: number;
  totalPayments: number;
}

const initialStats: AdminStats = {
  totalUsers: 0,
  totalTechnicians: 0,
  totalCustomers: 0,
  totalServices: 0,
  pendingServices: 0,
  approvedServices: 0,
  totalBookings: 0,
  totalPayments: 0,
};

const statCards = [
  {
    title: "Total Users",
    key: "totalUsers",
    icon: Users,
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Customers",
    key: "totalCustomers",
    icon: UserRound,
    color: "bg-purple-50 text-purple-700",
  },
  {
    title: "Technicians",
    key: "totalTechnicians",
    icon: Wrench,
    color: "bg-orange-50 text-orange-700",
  },
  {
    title: "Total Services",
    key: "totalServices",
    icon: ClipboardList,
    color: "bg-cyan-50 text-cyan-700",
  },
  {
    title: "Pending Approval",
    key: "pendingServices",
    icon: Clock,
    color: "bg-amber-50 text-amber-700",
  },
  {
    title: "Approved Services",
    key: "approvedServices",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Total Bookings",
    key: "totalBookings",
    icon: ClipboardList,
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    title: "Successful Payments",
    key: "totalPayments",
    icon: CreditCard,
    color: "bg-teal-50 text-teal-700",
  },
] as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = session?.user as
    | {
        name?: string;
        email?: string;
        role?: string;
      }
    | undefined;

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    if (user?.role !== "admin") {
      if (user?.role === "technician") {
        router.replace("/dashboard/technician/requests");
      } else {
        router.replace("/dashboard/customer");
      }
    }
  }, [isPending, session, user?.role, router]);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const response = await api.get("/admin/stats");

      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        toast.error("Unable to load dashboard statistics.");
      }
    } catch (error) {
      console.error("Admin stats error:", error);
      toast.error("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
useEffect(() => {
  if (isPending || user?.role !== "admin") return;

  let cancelled = false;

  const loadStats = async () => {
    try {
      const response = await api.get("/admin/stats");

      if (!cancelled && response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      if (!cancelled) {
        console.error("Admin stats error:", error);
        toast.error("Failed to load dashboard statistics.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  void loadStats();

  return () => {
    cancelled = true;
  };
}, [isPending, user?.role]);

  if (isPending || !session || user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-teal-700" />
      </div>
    );
  }

  const quickActions = [
    {
      title: "Manage Users",
      description: "View users and manage account roles.",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Manage Services",
      description: "Review and approve technician services.",
      href: "/dashboard/admin/services",
      icon: Wrench,
    },
    {
      title: "All Bookings",
      description: "Monitor customer repair bookings.",
      href: "/dashboard/admin/bookings",
      icon: ClipboardList,
    },
    {
      title: "Payment Records",
      description: "Review successful payment records.",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-teal-700">
              <ShieldCheck size={17} />
              ADMIN CONTROL PANEL
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {user.name || "Admin"}. Manage your FixMate
              platform from here.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchStats(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh Statistics
          </button>
        </div>

        <div className="mb-8 rounded-2xl bg-linear-to-r from-teal-900 to-teal-700 p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-teal-100">
                Platform Overview
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Everything under control.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-teal-100">
                Monitor users, repair services, bookings and payment activity
                from one central dashboard.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <LayoutDashboard size={34} />
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-slate-900">
              Platform Statistics
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Live information from your FixMate database.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.key}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className={`rounded-xl p-3 ${card.color}`}>
                      <Icon size={23} />
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      LIVE
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {loading ? (
                      <span className="inline-block h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
                    ) : (
                      stats[card.key].toLocaleString("en-BD")
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-slate-900">
              Quick Management
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Quickly access important administration sections.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <span className="rounded-xl bg-teal-50 p-3 text-teal-700 transition group-hover:bg-teal-700 group-hover:text-white">
                      <Icon size={24} />
                    </span>

                    <div>
                      <h3 className="font-extrabold text-slate-900">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    size={20}
                    className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
