import Link from "next/link";
import { Wrench, ArrowRight, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="container-custom grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="mb-5 inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Wrench size={22} />
            </span>
            <span className="text-2xl font-extrabold text-white">
              Fix<span className="text-teal-400">Mate</span>
            </span>
          </Link>

          <p className="max-w-xs text-sm leading-7 text-slate-400">
            Your trusted partner for smart device and home appliance repair.
            Quality service, reliable technicians, and peace of mind.
          </p>
        </div>

        <div>
          <h3 className="mb-5 font-bold text-white">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-teal-400">Home</Link></li>
            <li><Link href="/services" className="hover:text-teal-400">Browse Services</Link></li>
            <li><Link href="/about" className="hover:text-teal-400">About Us</Link></li>
            <li><Link href="/sign-in" className="hover:text-teal-400">Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-bold text-white">For Professionals</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/sign-up" className="hover:text-teal-400">Become a Technician</Link></li>
            <li><Link href="/sign-up" className="hover:text-teal-400">Create an Account</Link></li>
            <li><Link href="/dashboard/profile" className="hover:text-teal-400">My Profile</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-bold text-white">Contact Us</h3>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-center gap-3">
              <MapPin size={18} className="shrink-0 text-teal-400" />
              Bangladesh
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-teal-400" />
              support@fixmate.com
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-teal-400" />
              +880 1700-000000
            </li>
          </ul>

          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-400 hover:text-teal-300"
          >
            Explore Services <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container-custom flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>Copyright 2026 FixMate. All rights reserved.</p>
          <p>Built for better repair experiences.</p>
        </div>
      </div>
    </footer>
  );
}