
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, Wrench, MapPin, Clock, ArrowRight, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

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
  technicianName: string;
};

const categories = [
  "All Categories",
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [serviceMode, setServiceMode] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const params: Record<string, string> = {};

        if (search.trim()) params.search = search.trim();
        if (category !== "All Categories") params.category = category;
        if (serviceMode) params.serviceMode = serviceMode;
        if (sort) params.sort = sort;

        const response = await api.get("/services", {
          params,
          signal: controller.signal,
        });

        setServices(response.data.services || []);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        console.error("Services fetch error:", err);
        setError("Unable to load services. Please check your connection and try again.");
        toast.error("Failed to load services.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchServices();

    return () => controller.abort();
  }, [search, category, serviceMode, sort]);

  const resetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setServiceMode("");
    setSort("");
  };

  return (
    <div className="min-h-screen">
      <section className="bg-linear-to-br from-teal-900 via-teal-800 to-slate-900 py-20 text-white">
        <div className="container-custom">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
            Find the right professional
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Reliable Repair Services, Just a Click Away.
          </h1>
          <p className="mt-5 max-w-xl leading-8 text-teal-50/80">
            Browse trusted repair services, compare prices, and find the right
            technician for your home appliances and devices.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-9">
            <span className="section-label">
              <Wrench size={15} /> Our Services
            </span>
            <h2 className="section-title">Explore All Services</h2>
            <p className="section-description">
              Find professional repair solutions for your everyday devices and
              home appliances.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative lg:col-span-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-600"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={serviceMode}
                onChange={(e) => setServiceMode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-600"
              >
                <option value="">All Service Modes</option>
                <option value="Home Visit">Home Visit</option>
                <option value="Shop Drop-off">Shop Drop-off</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-600"
              >
                <option value="">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                <SlidersHorizontal size={15} className="mr-1 inline" />
                Showing <strong className="text-slate-800">{services.length}</strong> services
              </p>
              <button
                onClick={resetFilters}
                className="text-sm font-bold text-teal-700 transition hover:text-teal-900"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="h-52 bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="h-6 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="h-10 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
              <p className="font-semibold text-red-700">{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setSort((current) => current);
                }}
                className="btn-primary mt-5"
              >
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Wrench size={28} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-800">
                No Services Found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                No services match your search. Try changing your filters.
              </p>
              <button onClick={resetFilters} className="btn-primary mt-6">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="card overflow-hidden"
                >
                  <div className="relative h-52 bg-slate-100">
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-teal-700">
                        <Wrench size={42} />
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-teal-800 shadow">
                      {service.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                      {service.description.length > 100
                        ? `${service.description.slice(0, 100)}...`
                        : service.description}
                    </p>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
                      <p>
                        <MapPin size={15} className="mr-2 inline text-teal-700" />
                        {service.serviceArea} · {service.serviceMode}
                      </p>
                      <p>
                        <Clock size={15} className="mr-2 inline text-teal-700" />
                        {service.estimatedDuration}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-400">Starting from</p>
                        <p className="text-xl font-extrabold text-teal-800">
                          ৳{service.basePrice.toLocaleString("en-BD")}
                        </p>
                      </div>
                      <Link
                        href={`/services/${service._id}`}
                        className="btn-primary px-4! 	py-3!"
                      >
                        View Details <ArrowRight size={16} />
                      </Link>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      Technician: {service.technicianName}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
