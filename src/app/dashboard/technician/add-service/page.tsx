
"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  ImagePlus,
  Loader2,
  Wrench,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";

const categories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

type ServiceForm = {
  title: string;
  category: string;
  description: string;
  basePrice: string;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
};

const initialForm: ServiceForm = {
  title: "",
  category: "",
  description: "",
  basePrice: "",
  estimatedDuration: "",
  serviceMode: "Home Visit",
  serviceArea: "",
};

export default function AddServicePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [form, setForm] = useState<ServiceForm>(initialForm);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userRole = (
    session?.user as { role?: string } | null | undefined
  )?.role;

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
    } else if (!isPending && session && userRole !== "technician") {
      router.replace("/");
      toast.error("Only technicians can add services.");
    }
  }, [isPending, session, userRole, router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WEBP or GIF image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select a service image.");
      return;
    }

    if (!form.category) {
      toast.error("Please select a service category.");
      return;
    }

    const price = Number(form.basePrice);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Please enter a valid service price.");
      return;
    }

    try {
      setSubmitting(true);
      setUploading(true);

      // Step 1: Upload image to ImgBB through backend.
      const imageData = new FormData();
      imageData.append("image", image);

      const uploadResponse = await api.post("/upload", imageData);

      if (!uploadResponse.data?.success || !uploadResponse.data?.image?.url) {
        throw new Error("Image upload failed. Please try again.");
      }

      const imageUrl = uploadResponse.data.image.url;

      setUploading(false);

      // Step 2: Create service using the uploaded image URL.
      const serviceData = {
        ...form,
        basePrice: price,
        image: imageUrl,
      };

      const response = await api.post("/services", serviceData);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to create service.");
      }

      toast.success("Service submitted! Waiting for admin approval.");

      setForm(initialForm);
      setImage(null);
      setPreview("");

      const fileInput = document.getElementById(
        "service-image"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";
    } catch (error: unknown) {
      console.error("Add service error:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };

        toast.error(
          apiError.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  if (isPending || !session || userRole !== "technician") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-teal-700"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-teal-700">
            <Wrench size={15} />
            Technician Dashboard
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Add a New Service
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Share your repair expertise with customers. Add accurate
            information and a clear service image.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Service Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Provide the basic details of your repair service.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Service Title *
              </label>
              <input
                required
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Smartphone Display Repair"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category *
              </label>
              <select
                required
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Service Price (BDT) *
              </label>
              <input
                required
                type="number"
                min="1"
                step="1"
                name="basePrice"
                value={form.basePrice}
                onChange={handleChange}
                placeholder="e.g. 1500"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Estimated Duration *
              </label>
              <input
                required
                name="estimatedDuration"
                value={form.estimatedDuration}
                onChange={handleChange}
                placeholder="e.g. 1-2 hours"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Service Mode *
              </label>
              <select
                required
                name="serviceMode"
                value={form.serviceMode}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                <option value="Home Visit">Home Visit</option>
                <option value="Shop Drop-off">Shop Drop-off</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Service Area *
              </label>
              <input
                required
                name="serviceArea"
                value={form.serviceArea}
                onChange={handleChange}
                placeholder="e.g. Chattogram, Bangladesh"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Service Description *
              </label>
              <textarea
                required
                rows={5}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your repair service, what is included, and what customers can expect..."
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="border-t border-slate-100 pt-7">
            <h2 className="text-lg font-bold text-slate-900">
              Service Image
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload a clear image. JPG, PNG, WEBP or GIF, maximum 5 MB.
            </p>

            <div className="mt-5">
              {preview ? (
                <div className="relative max-w-md overflow-hidden rounded-xl border border-slate-200">
                  <Image
                    src={preview}
                    alt="Service preview"
                    width={448}
                    height={224}
                    unoptimized
                    className="h-56 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreview("");
                      const input = document.getElementById(
                        "service-image"
                      ) as HTMLInputElement | null;
                      if (input) input.value = "";
                    }}
                    className="absolute right-3 top-3 rounded-full bg-white p-2 text-slate-700 shadow hover:text-red-600"
                    aria-label="Remove image"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="service-image"
                  className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-teal-500 hover:bg-teal-50/40"
                >
                  <ImagePlus className="mb-3 h-10 w-10 text-teal-700" />
                  <span className="text-sm font-bold text-slate-800">
                    Click to upload service image
                  </span>
                  <span className="mt-2 text-xs text-slate-500">
                    PNG, JPG, WEBP or GIF (up to 5 MB)
                  </span>
                </label>
              )}

              <input
                id="service-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Submission */}
          <div className="border-t border-slate-100 pt-7">
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Your service will be submitted for admin approval.
                It will appear in Browse Services after approval.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="btn-primary w-full py-4 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-52"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {uploading ? "Uploading image..." : "Submitting..."}
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Submit Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}