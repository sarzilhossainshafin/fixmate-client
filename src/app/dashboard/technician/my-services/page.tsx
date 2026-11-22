
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Wrench,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { authClient } from "@/lib/auth-client";

type Service = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isAvailable: boolean;
  createdAt: string;
};

export default function MyServicesPage() {
  const { data: session, isPending } = authClient.useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  // Fetch technician services
  const loadServices = useCallback(async () => {
    try {
      const response = await api.get("/services/my");

      if (response.data?.success) {
        setServices(response.data.services || []);
      } else {
        toast.error("Failed to load your services.");
      }
    } catch (error) {
      console.error("Load my services error:", error);
      toast.error("Unable to load your services.");
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
        void loadServices();
      }
    });

    return () => {
      active = false;
    };
  }, [isPending, session, loadServices]);

  // Refresh services (button click)
  const handleRefresh = async () => {
    setLoading(true);
    await loadServices();
  };

  // Delete service
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      setActionId(id);

      const response = await api.delete(`/services/${id}`);

      if (response.data?.success) {
        setServices((prev) =>
          prev.filter((service) => service._id !== id)
        );

        toast.success("Service deleted successfully.");
      }
    } catch (error) {
      console.error("Delete service error:", error);
      toast.error("Failed to delete service.");
    } finally {
      setActionId(null);
    }
  };

  // Toggle service availability
  const handleAvailability = async (id: string) => {
    try {
      setActionId(id);

      const response = await api.patch(
        `/services/${id}/availability`
      );

      if (response.data?.success) {
        setServices((prev) =>
          prev.map((service) =>
            service._id === id
              ? {
                  ...service,
                  isAvailable: response.data.isAvailable,
                }
              : service
          )
        );

        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Availability update error:", error);
      toast.error("Failed to update service availability.");
    } finally {
      setActionId(null);
    }
  };

  // Filter services
  const filteredServices =
    filter === "all"
      ? services
      : services.filter(
          (service) => service.approvalStatus === filter
        );

  // Status styles
  const getStatusStyle = (status: Service["approvalStatus"]) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  // Loading state
  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Wrench className="mb-4 h-10 w-10 text-teal-700" />
        <h2 className="text-xl font-bold">Please sign in</h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to manage your services.
        </p>
        <Link href="/sign-in" className="btn-primary mt-5">
          Sign In
        </Link>
      </div>
    );
  }

  // Technician role check
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
          href="/dashboard/technician/add-service"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"
        >
          <ArrowLeft size={17} />
          Back to Add Service
        </Link>

        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-teal-700">
              Technician Dashboard
            </span>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              My Services
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              Manage your repair services, availability and submissions.
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

            <Link
              href="/dashboard/technician/add-service"
              className="btn-primary"
            >
              <Plus size={17} />
              Add Service
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Services",
              value: services.length,
              color: "text-slate-900",
            },
            {
              label: "Approved",
              value: services.filter(
                (s) => s.approvalStatus === "approved"
              ).length,
              color: "text-emerald-700",
            },
            {
              label: "Pending",
              value: services.filter(
                (s) => s.approvalStatus === "pending"
              ).length,
              color: "text-amber-700",
            },
            {
              label: "Rejected",
              value: services.filter(
                (s) => s.approvalStatus === "rejected"
              ).length,
              color: "text-red-700",
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
          {[
            { label: "All Services", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                filter === item.value
                  ? "bg-teal-700 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-teal-600 hover:text-teal-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Service list */}
        {filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <Wrench className="mx-auto mb-4 h-12 w-12 text-slate-300" />

            <h2 className="text-xl font-bold text-slate-800">
              {services.length === 0
                ? "No services yet"
                : "No services in this category"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {services.length === 0
                ? "Add your first repair service to get started."
                : "Try selecting another filter."}
            </p>

            {services.length === 0 && (
              <Link
                href="/dashboard/technician/add-service"
                className="btn-primary mt-6"
              >
                <Plus size={17} />
                Add Your First Service
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <article
                key={service._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Service image */}
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover"
                  />

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusStyle(
                      service.approvalStatus
                    )}`}
                  >
                    {service.approvalStatus}
                  </span>
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      {service.category}
                    </span>

                    <span className="text-lg font-extrabold text-slate-900">
                      ৳{service.basePrice.toLocaleString("en-BD")}
                    </span>
                  </div>

                  <h2 className="text-lg font-extrabold text-slate-900">
                    {service.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <div className="mt-4 space-y-2 text-xs font-medium text-slate-500">
                    <p className="flex items-center gap-2">
                      <Clock size={14} />
                      {service.estimatedDuration}
                    </p>

                    <p className="flex items-center gap-2">
                      <MapPin size={14} />
                      {service.serviceArea}
                    </p>
                  </div>

                  {/* Service actions */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span
                      className={`text-xs font-bold ${
                        service.isAvailable
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}
                    >
                      {service.isAvailable ? "Available" : "Unavailable"}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Availability */}
                      <button
                        onClick={() => handleAvailability(service._id)}
                        disabled={actionId === service._id}
                        title={
                          service.isAvailable
                            ? "Make unavailable"
                            : "Make available"
                        }
                        className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:border-teal-600 hover:text-teal-700 disabled:opacity-50"
                      >
                        {service.isAvailable ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>

                      {/* Edit */}
                      <Link
                        href={`/dashboard/technician/edit-service/${service._id}`}
                        title="Edit service"
                        className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:border-teal-600 hover:text-teal-700"
                      >
                        <Pencil size={16} />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(service._id)}
                        disabled={actionId === service._id}
                        title="Delete service"
                        className="rounded-lg border border-slate-200 p-2.5 text-red-500 transition hover:border-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionId === service._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
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
