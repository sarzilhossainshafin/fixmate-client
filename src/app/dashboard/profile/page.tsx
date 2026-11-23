
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CalendarDays,
  ArrowLeft,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  const user = session.user as {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    area?: string;
    bio?: string;
    emailVerified?: boolean;
    createdAt?: string | Date;
  };

  const role = user.role || "customer";

  const dashboardLink =
    role === "technician"
      ? "/dashboard/technician/requests"
      : "/dashboard/customer";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  const profileDetails = [
    {
      label: "Full Name",
      value: user.name || "Not provided",
      icon: UserCircle,
    },
    {
      label: "Email Address",
      value: user.email || "Not provided",
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: user.phone || "Not provided",
      icon: Phone,
    },
    {
      label: "Area / Location",
      value: user.area || "Not provided",
      icon: MapPin,
    },
    {
      label: "Account Role",
      value: role,
      icon: ShieldCheck,
    },
    {
      label: "Member Since",
      value: memberSince,
      icon: CalendarDays,
    },
  ];

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href={dashboardLink}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-linear-to-r from-teal-800 to-teal-600 px-6 py-10 text-white sm:px-10">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
                <UserCircle size={48} />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-teal-100">
                  My Account
                </p>
                <h1 className="mt-2 text-3xl font-extrabold">
                  {user.name || "User"}
                </h1>
                <p className="mt-1 text-sm text-teal-100">
                  {user.email}
                </p>
                <span className="mt-3 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold capitalize">
                  {role}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-7">
              <h2 className="text-xl font-extrabold text-slate-900">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your account details and personal information.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {profileDetails.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-teal-50 p-3 text-teal-700">
                        <Icon size={21} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-bold capitalize text-slate-900">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {user.bio && (
              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900">About Me</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {user.bio}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-teal-50 p-5">
              <div>
                <p className="font-bold text-teal-900">
                  Account Verification
                </p>
                <p className="mt-1 text-sm text-teal-700">
                  {user.emailVerified
                    ? "Your email address is verified."
                    : "Your email address is not verified yet."}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  user.emailVerified
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {user.emailVerified ? "Verified" : "Unverified"}
              </span>
            </div>

            <Link
              href={dashboardLink}
              className="btn-primary mt-8 w-full justify-center"
            >
              <LayoutDashboard size={18} />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
