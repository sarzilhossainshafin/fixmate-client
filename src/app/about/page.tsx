
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted Technicians",
    description:
      "Connect with skilled technicians who are ready to handle your repair needs with care and professionalism.",
  },
  {
    icon: Clock,
    title: "Convenient Booking",
    description:
      "Book repair services easily and keep track of your requests from your personal dashboard.",
  },
  {
    icon: Users,
    title: "Customer First",
    description:
      "We focus on making the repair experience simple, transparent and convenient for everyone.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-linear-to-r from-teal-900 to-teal-700 px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
            <Wrench size={17} />
            About FixMate
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
            Making Repairs
            <br />
            Simple and Reliable
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-teal-50 sm:text-lg">
            FixMate connects customers with technicians for smartphone and
            home appliance repair services. Our goal is to make finding,
            booking and managing repairs easier.
          </p>

          <Link
            href="/services"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-extrabold text-teal-800 transition hover:bg-teal-50"
          >
            Explore Services
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-widest text-teal-700">
              Who We Are
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Your Repair Partner
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Whether you need a smartphone repair or help with a home
              appliance, FixMate helps you find the right service and manage
              your repair journey in one place.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="inline-flex rounded-xl bg-teal-50 p-3 text-teal-700">
                    <Icon size={26} />
                  </span>

                  <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-widest text-teal-700">
                Why FixMate?
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
                Repair Management Made Easier
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                From submitting a service request to tracking repair progress
                and completing payments, FixMate brings the essential steps
                together.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Browse available repair services",
                "Book a convenient repair appointment",
                "Track your booking status",
                "Manage payments and repair history",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2
                    size={21}
                    className="shrink-0 text-teal-700"
                  />
                  <p className="text-sm font-semibold text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
