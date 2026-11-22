
"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";

interface Service {
  _id: string;
  title?: string;
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  duration?: string;
  serviceMode?: string;
  serviceArea?: string;
  area?: string;
  image?: string;
  imageUrl?: string;
  technicianName?: string;
  technicianEmail?: string;
}

function ServiceDetailsContent() {
  const params = useParams<{ id: string }>();
  const serviceId = params.id;

  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [problemDescription, setProblemDescription] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Load service details
  useEffect(() => {
    let active = true;

    async function fetchService() {
      try {
        const response = await fetch(`${apiUrl}/services/${serviceId}`, {
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success || !result.service) {
          throw new Error(result.message || "Service not found.");
        }

        if (active) {
          setService(result.service);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load service details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (serviceId) {
      void fetchService();
    }

    return () => {
      active = false;
    };
  }, [apiUrl, serviceId]);

  // Submit booking
  async function handleBooking(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!session) {
      router.push("/sign-in");
      return;
    }

    const user = session.user as {
      role?: string;
    };

    if (user.role !== "customer") {
      setError("Only customers can book a service.");
      return;
    }

    if (
      !customerPhone.trim() ||
      !address.trim() ||
      !preferredDate ||
      !problemDescription.trim()
    ) {
      setError("Please fill in all booking fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error(
          "Unable to get authentication token. Please sign in again."
        );
      }

      const response = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify({
          serviceId,
          customerPhone: customerPhone.trim(),
          address: address.trim(),
          preferredDate,
          problemDescription: problemDescription.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Booking failed. Please try again."
        );
      }

      router.push("/dashboard/customer/bookings");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading || sessionLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-200 px-4">
        <p className="text-lg font-semibold">
          Loading service details...
        </p>
      </main>
    );
  }

  // Service not found
  if (!service) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base-200 px-4">
        <h1 className="text-2xl font-bold">
          Service Not Found
        </h1>

        <p className="text-center text-error">
          {error || "This service is not available."}
        </p>

        <Link href="/services" className="btn btn-primary">
          Browse Services
        </Link>
      </main>
    );
  }

  const user = session?.user as
    | { role?: string; phone?: string }
    | undefined;

  const isCustomer = user?.role === "customer";

  const serviceName =
    service.title || service.name || "Repair Service";

  const serviceImage = service.image || service.imageUrl;

  return (
    <main className="min-h-screen bg-base-200 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/services"
          className="mb-6 inline-block text-sm font-semibold text-primary hover:underline"
        >
          ← Back to Services
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Service Details */}
          <section className="card overflow-hidden bg-base-100 shadow-xl">
            {serviceImage ? (
              <Image
                src={serviceImage}
                alt={serviceName}
                width={900}
                height={520}
                unoptimized
                className="h-72 w-full object-cover"
              />
            ) : (
              <div className="flex h-72 items-center justify-center bg-base-300">
                <span className="text-6xl">🔧</span>
              </div>
            )}

            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="badge badge-primary badge-outline">
                  {service.category || "Repair Service"}
                </span>

                <span className="text-xl font-bold text-primary">
                  {typeof service.price === "number"
                    ? `৳${service.price}`
                    : "Contact for price"}
                </span>
              </div>

              <h1 className="text-3xl font-bold">
                {serviceName}
              </h1>

              <p className="leading-7 text-base-content/70">
                {service.description || "No description available."}
              </p>

              <div className="divider" />

              <div className="space-y-3">
                <p>
                  <strong>Duration:</strong>{" "}
                  {service.duration || "Not specified"}
                </p>

                <p>
                  <strong>Service Mode:</strong>{" "}
                  {service.serviceMode || "Not specified"}
                </p>

                <p>
                  <strong>Service Area:</strong>{" "}
                  {service.serviceArea ||
                    service.area ||
                    "Not specified"}
                </p>

                <p>
                  <strong>Technician:</strong>{" "}
                  {service.technicianName ||
                    service.technicianEmail ||
                    "Assigned technician"}
                </p>
              </div>
            </div>
          </section>

          {/* Booking Form */}
          <section className="card h-fit bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">
                Book This Service
              </h2>

              {!session ? (
                <div className="space-y-4">
                  <p className="text-base-content/70">
                    Please sign in with your customer account to book this service.
                  </p>

                  <Link
                    href="/sign-in"
                    className="btn btn-primary w-full"
                  >
                    Sign In to Book
                  </Link>
                </div>
              ) : !isCustomer ? (
                <div className="alert alert-warning">
                  Only customer accounts can book services.
                </div>
              ) : (
                <form
                  onSubmit={handleBooking}
                  className="space-y-4"
                >
                  {/* Phone */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Phone Number
                      </span>
                    </label>

                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(event) =>
                        setCustomerPhone(event.target.value)
                      }
                      placeholder={
                        user.phone || "Enter your phone number"
                      }
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Service Address
                      </span>
                    </label>

                    <textarea
                      value={address}
                      onChange={(event) =>
                        setAddress(event.target.value)
                      }
                      placeholder="Enter your full address"
                      className="textarea textarea-bordered w-full"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Preferred Date */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Preferred Date
                      </span>
                    </label>

                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(event) =>
                        setPreferredDate(event.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  {/* Problem Description */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Describe Your Problem
                      </span>
                    </label>

                    <textarea
                      value={problemDescription}
                      onChange={(event) =>
                        setProblemDescription(event.target.value)
                      }
                      placeholder="Explain the problem with your device or appliance..."
                      className="textarea textarea-bordered w-full"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="alert alert-error">
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary w-full"
                  >
                    {submitting
                      ? "Submitting Booking..."
                      : "Confirm Booking"}
                  </button>

                  <p className="text-center text-xs text-base-content/60">
                    Payment will be available after the technician completes the job.
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ServiceDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-base-200 px-4">
          <p className="text-lg font-semibold">
            Loading service details...
          </p>
        </main>
      }
    >
      <ServiceDetailsContent />
    </Suspense>
  );
}
