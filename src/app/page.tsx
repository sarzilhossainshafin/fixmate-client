
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  Laptop,
  Refrigerator,
  WashingMachine,
  Tv,
  Wind,
  ShieldCheck,
  Clock,
  BadgeCheck,
  Wrench,
  Search,
  CalendarCheck,
  ThumbsUp,
  Star,
} from "lucide-react";

const categories = [
  { name: "Mobile Repair", icon: Smartphone, color: "bg-blue-50 text-blue-600" },
  { name: "Laptop Repair", icon: Laptop, color: "bg-purple-50 text-purple-600" },
  { name: "Refrigerator", icon: Refrigerator, color: "bg-cyan-50 text-cyan-600" },
  { name: "Washing Machine", icon: WashingMachine, color: "bg-orange-50 text-orange-600" },
  { name: "TV Repair", icon: Tv, color: "bg-pink-50 text-pink-600" },
  { name: "AC Repair", icon: Wind, color: "bg-teal-50 text-teal-600" },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Verified Technicians",
    description: "Connect with skilled professionals and trusted repair experts.",
  },
  {
    icon: Clock,
    title: "Quick Service",
    description: "Book a repair service at a time that works best for you.",
  },
  {
    icon: BadgeCheck,
    title: "Reliable Solutions",
    description: "Get dependable repair support for your valuable devices.",
  },
];

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find a Service",
    description: "Browse repair services and choose the one you need.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book a Technician",
    description: "Select a suitable date and submit your service request.",
  },
  {
    number: "03",
    icon: ThumbsUp,
    title: "Get It Fixed",
    description: "Get your device repaired by a skilled technician.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute -right-40 -top-40 h-125 w-125 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 h-125 w-125 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="container-custom relative grid 	min-h-152.5 items-center gap-12 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-300">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              Your Trusted Repair Partner
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Smart Repair.
              <br />
              <span className="text-teal-400">Simple Life.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              From smartphones to home appliances, find skilled technicians
              and get reliable repair services without the hassle.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/services" className="btn-primary">
                Explore Services
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-[10px] border border-slate-600 px-6 py-3 text-sm font-bold text-white transition hover:border-teal-400 hover:text-teal-400"
              >
                Join as Technician
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-slate-800 pt-8">
              <div>
                <p className="text-2xl font-extrabold text-white">Easy</p>
                <p className="mt-1 text-xs text-slate-400">Online Booking</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">Skilled</p>
                <p className="mt-1 text-xs text-slate-400">Technicians</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">Secure</p>
                <p className="mt-1 text-xs text-slate-400">Payments</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[36px] bg-teal-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-400">
                    FIXMATE SERVICE CENTER
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    What needs fixing?
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-400">
                  <Wrench size={25} />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                {categories.slice(0, 4).map((category) => {
                  const Icon = category.icon;

                  return (
                    <Link
                      key={category.name}
                      href="/services"
                      className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-teal-500 hover:bg-slate-800/70"
                    >
                      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${category.color}`}>
                        <Icon size={23} />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {category.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Explore services
                      </p>
                    </Link>
                  );
                })}
              </div>

              <Link
                href="/services"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-4 text-sm font-bold text-white transition hover:bg-teal-500"
              >
                Find Your Repair Service
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="absolute -bottom-6 -left-5 hidden items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl sm:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/15 text-amber-400">
                <Star size={22} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Quality Service</p>
                <p className="text-xs text-slate-400">Care you can trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <span className="section-label">OUR SERVICES</span>
            <h2 className="section-title">Repair Services for Every Need</h2>
            <p className="section-description mx-auto">
              Find the right repair solution for your devices and home appliances.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.name}
                  href="/services"
                  className="card flex flex-col items-center p-5 text-center"
                >
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${category.color}`}>
                    <Icon size={27} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {category.name}
                  </h3>
                  <span className="mt-2 text-xs font-semibold text-teal-700">
                    Explore <ArrowRight className="ml-1 inline" size={12} />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/services" className="btn-outline">
              View All Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="text-center">
            <span className="section-label">WHY FIXMATE</span>
            <h2 className="section-title">A Better Way to Get Things Fixed</h2>
            <p className="section-description mx-auto">
              We make finding reliable repair professionals easier, faster,
              and more convenient.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div key={benefit.title} className="card p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <Icon size={30} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <span className="section-label">SIMPLE PROCESS</span>
            <h2 className="section-title">How FixMate Works</h2>
            <p className="section-description mx-auto">
              Getting your device repaired takes only three simple steps.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative text-center">
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
                    <Icon size={34} />
                    <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="bg-teal-800 py-16">
        <div className="container-custom flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Fix It?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-teal-100">
              Find a trusted technician today and give your devices the care they deserve.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-teal-800 transition hover:bg-teal-50"
          >
            Browse Services <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
