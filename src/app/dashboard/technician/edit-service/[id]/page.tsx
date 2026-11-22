
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { authClient } from "@/lib/auth-client";

type ServiceForm = {
  title: string;
  category: string;
  description: string;
  basePrice: string;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
};

type ServiceData = {
  _id: string;
  title?: string;
  category?: string;
  description?: string;
  image?: string;
  basePrice?: number;
  estimatedDuration?: string;
  serviceMode?: string;
  serviceArea?: string;
};

const initialForm: ServiceForm = {
  title: "",
  category: "Smartphone",
  description: "",
  basePrice: "",
  estimatedDuration: "",
  serviceMode: "Home Visit",
  serviceArea: "",
};

const categories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

function EditServiceContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const serviceId = params.id;

  const { data: session, isPending } = authClient.useSession();

  const [form, setForm] = useState<ServiceForm>(initialForm);
  const [currentImage, setCurrentImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Load service owned by the logged-in technician
  const loadService = useCallback(async () => {
    try {
      setLoadError(false);

      const response = await api.get(
        `/services/my/${serviceId}`
      );

      const service: ServiceData | undefined =
        response.data?.service;

      if (!service || !service._id) {
        throw new Error("Service not found.");
      }

      setForm({
        title: service.title || "",
        category: service.category || "Smartphone",
        description: service.description || "",
        basePrice: String(service.basePrice ?? ""),
        estimatedDuration: service.estimatedDuration || "",
        serviceMode: service.serviceMode || "Home Visit",
        serviceArea: service.serviceArea || "",
      });

      setCurrentImage(service.image || "");
    } catch (error) {
      console.error("Load service error:", error);
      setLoadError(true);
      toast.error("Unable to load service details.");
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  // Authentication and service loading
  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    const role = (session.user as { role?: string }).role;

    if (role !== "technician") {
      router.replace("/");
      return;
    }

    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        void loadService();
      }
    });

    return () => {
      active = false;
    };
  }, [isPending, session, router, loadService]);

  // Handle input changes
  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP and GIF images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
  };

  // Update service
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.basePrice ||
      !form.estimatedDuration.trim() ||
      !form.serviceArea.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const price = Number(form.basePrice);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Please enter a valid service price.");
      return;
    }

    try {
      setSaving(true);

      let imageUrl = currentImage;

      // Upload new image only if selected
      if (imageFile) {
        const imageData = new FormData();
        imageData.append("image", imageFile);

        const uploadResponse = await api.post(
          "/upload",
          imageData
        );

        if (!uploadResponse.data?.success) {
          throw new Error("Image upload failed.");
        }

        imageUrl = uploadResponse.data.image.url;
      }

      const updatedData = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        image: imageUrl,
        basePrice: price,
        estimatedDuration: form.estimatedDuration.trim(),
        serviceMode: form.serviceMode,
        serviceArea: form.serviceArea.trim(),
      };

      const response = await api.patch(
        `/services/${serviceId}`,
        updatedData
      );

      if (response.data?.success) {
        toast.success(
          "Service updated successfully! Waiting for admin approval."
        );

        router.push("/dashboard/technician/my-services");
        router.refresh();
      } else {
        toast.error(
          response.data?.message || "Failed to update service."
        );
      }
    } catch (error) {
      console.error("Update service error:", error);
      toast.error("Unable to update service. Please try again.");
    } finally {
      setSaving(false);
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Wrench className="mb-4 h-10 w-10 text-teal-700" />
        <h2 className="text-xl font-bold">Please sign in</h2>
        <Link href="/sign-in" className="btn-primary mt-5">
          Sign In
        </Link>
      </div>
    );
  }

  const userRole = (session.user as { role?: string }).role;

  if (userRole !== "technician") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <Link href="/" className="btn-primary mt-5">
          Back to Home
        </Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Wrench className="mb-4 h-10 w-10 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-900">
          Unable to load service
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The service may not exist or may not belong to your account.
        </p>
        <button
          onClick={() => {
            setLoading(true);
            void loadService();
          }}
          className="btn-primary mt-5"
        >
          Try Again
        </button>
        <Link
          href="/dashboard/technician/my-services"
          className="mt-4 text-sm font-semibold text-teal-700"
        >
          Back to My Services
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/technician/my-services"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"
        >
          <ArrowLeft size={17} />
          Back to My Services
        </Link>

        <div className="mb-8">
          <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-teal-700">
            Technician Dashboard
          </span>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Edit Service
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Update your repair service information and save your changes.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Service Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Example: Smartphone Display Repair"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="basePrice"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Base Price (BDT) *
              </label>
              <input
                id="basePrice"
                name="basePrice"
                type="number"
                min="1"
                value={form.basePrice}
                onChange={handleChange}
                placeholder="1500"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Service Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your repair service..."
              required
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="estimatedDuration"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Estimated Duration *
              </label>
              <input
                id="estimatedDuration"
                name="estimatedDuration"
                type="text"
                value={form.estimatedDuration}
                onChange={handleChange}
                placeholder="Example: 1-2 hours"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label
                htmlFor="serviceMode"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Service Mode *
              </label>
              <select
                id="serviceMode"
                name="serviceMode"
                value={form.serviceMode}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                <option value="Home Visit">Home Visit</option>
                <option value="Shop Drop-off">Shop Drop-off</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="serviceArea"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Service Area *
            </label>
            <input
              id="serviceArea"
              name="serviceArea"
              type="text"
              value={form.serviceArea}
              onChange={handleChange}
              placeholder="Example: Chattogram"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold text-slate-700">
              Service Image
            </label>

            {currentImage && (
              <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={currentImage}
                  alt="Current service"
                  className="h-52 w-full object-cover"
                />
                <p className="bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Current service image
                </p>
              </div>
            )}

            <label
              htmlFor="image"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-5 py-8 text-center transition hover:border-teal-600 hover:bg-teal-50/30"
            >
              <Upload className="mb-3 h-8 w-8 text-teal-700" />
              <span className="text-sm font-bold text-slate-700">
                {imageFile ? imageFile.name : "Choose a new image"}
              </span>
              <span className="mt-2 text-xs text-slate-400">
                JPG, PNG, WEBP or GIF (Maximum 5MB)
              </span>
              <input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-xs text-slate-500">
              Leave this empty to keep your current image.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
              Admin approval required
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-700">
              After updating this service, it will be submitted for admin
              approval again.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/technician/my-services"
              className="btn-outline"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Update Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function EditServiceFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
    </div>
  );
}

export default function EditServicePage() {
  return (
    <Suspense fallback={<EditServiceFallback />}>
      <EditServiceContent />
    </Suspense>
  );
}
