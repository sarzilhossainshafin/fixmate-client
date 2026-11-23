
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";

interface AdminService {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
  technicianName?: string;
  technicianEmail?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isAvailable: boolean;
  createdAt?: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminServicesPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const user = session?.user as
    | { role?: string }
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

  useEffect(() => {
    if (isPending || user?.role !== "admin") return;

    let cancelled = false;

    const loadServices = async () => {
      try {
        const response = await api.get("/admin/services");

        if (!cancelled && response.data.success) {
          setServices(response.data.services || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Admin services error:", error);
          toast.error("Failed to load services.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadServices();

    return () => {
      cancelled = true;
    };
  }, [isPending, user?.role]);

  const refreshServices = async () => {
    setRefreshing(true);

    try {
      const response = await api.get("/admin/services");

      if (response.data.success) {
        setServices(response.data.services || []);
        toast.success("Services refreshed.");
      }
    } catch (error) {
      console.error("Refresh services error:", error);
      toast.error("Unable to refresh services.");
    } finally {
      setRefreshing(false);
    }
  };

  const updateApproval = async (
    serviceId: string,
    approvalStatus: "approved" | "rejected"
  ) => {
    const action = approvalStatus === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this service?`
    );

    if (!confirmed) return;

    setUpdatingId(serviceId);

    try {
      const response = await api.patch(
        `/admin/services/${serviceId}/approval`,
        { approvalStatus }
      );

      if (response.data.success) {
        setServices((current) =>
          current.map((service) =>
            service._id === serviceId
              ? { ...service, approvalStatus }
              : service
          )
        );

        toast.success(
          approvalStatus === "approved"
            ? "Service approved successfully."
            : "Service rejected successfully."
        );
      } else {
        toast.error(response.data.message || "Unable to update service.");
      }
    } catch (error) {
      console.error("Service approval error:", error);
      toast.error("Failed to update service approval.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredServices = services.filter((service) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      service.title.toLowerCase().includes(keyword) ||
      service.category.toLowerCase().includes(keyword) ||
      (service.technicianName || "").toLowerCase().includes(keyword) ||
      (service.technicianEmail || "").toLowerCase().includes(keyword) ||
      service.serviceArea.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      service.approvalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: services.length,
    pending: services.filter(
      (item) => item.approvalStatus === "pending"
    ).length,
    approved: services.filter(
      (item) => item.approvalStatus === "approved"
    ).length,
    rejected: services.filter(
      (item) => item.approvalStatus === "rejected"
    ).length,
  };

  if (isPending || !session || user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-teal-700"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-teal-700">
              <ShieldCheck size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Admin Control
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Manage Services
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review technician submissions and manage service approvals.
            </p>
          </div>

          <button
            onClick={refreshServices}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh Services
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "All Services",
              count: counts.all,
              icon: Wrench,
              color: "text-slate-800",
            },
            {
              label: "Pending",
              count: counts.pending,
              icon: Clock,
              color: "text-amber-600",
            },
            {
              label: "Approved",
              count: counts.approved,
              icon: CheckCircle2,
              color: "text-emerald-600",
            },
            {
              label: "Rejected",
              count: counts.rejected,
              icon: XCircle,
              color: "text-red-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    {item.label}
                  </p>
                  <Icon size={21} className={item.color} />
                </div>
                <p className={`mt-3 text-3xl font-black ${item.color}`}>
                  {item.count}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, category, technician..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                ["all", "pending", "approved", "rejected"] as StatusFilter[]
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-bold capitalize transition ${
                    statusFilter === status
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                  <span className="ml-1">
                    ({counts[status]})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-center">
            <Wrench size={42} className="mb-3 text-slate-300" />
            <h2 className="text-lg font-bold text-slate-800">
              No services found
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              No services match your current search or filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <article
                key={service._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-48 bg-slate-100">
                  {service.image ? (
                 <Image
  src={service.image}
  alt={service.title}
  fill
  unoptimized
  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
  className="object-cover"
/>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Wrench size={42} className="text-slate-300" />
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      service.approvalStatus === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : service.approvalStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {service.approvalStatus}
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      {service.category}
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      {service.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {service.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-xs text-slate-400">Base Price</p>
                      <p className="mt-1 font-bold text-slate-900">
                        ৳{Number(service.basePrice).toLocaleString("en-BD")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Duration</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {service.estimatedDuration}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Service Mode</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {service.serviceMode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Service Area</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {service.serviceArea}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-sm font-bold text-slate-800">
                      {service.technicianName || "Technician"}
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {service.technicianEmail || "Email unavailable"}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Submitted:{" "}
                      {service.createdAt
                        ? new Date(service.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </p>
                  </div>

                  {service.approvalStatus === "pending" ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          updateApproval(service._id, "approved")
                        }
                        disabled={updatingId === service._id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {updatingId === service._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateApproval(service._id, "rejected")
                        }
                        disabled={updatingId === service._id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center text-sm font-semibold text-slate-500">
                      {service.approvalStatus === "approved"
                        ? "This service is approved."
                        : "This service was rejected."}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
