
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Wrench,
  ArrowRight,
  UserCircle,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user as
    | {
        name?: string;
        email?: string;
        role?: string;
      }
    | undefined;

  const isLoggedIn = !!user;

  const handleSignOut = async () => {
    setLoggingOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        toast.error(result.error.message || "Sign out failed.");
        return;
      }

      toast.success("Signed out successfully!");
      setIsOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Unable to sign out.");
    } finally {
      setLoggingOut(false);
    }
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <nav className="container-custom flex h-[76px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white">
            <Wrench size={22} />
          </span>

          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Fix<span className="text-teal-700">Mate</span>
            <span className="ml-1 text-xs font-semibold text-slate-400">
              .
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-teal-700"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <UserCircle size={20} className="text-teal-700" />

                <div>
                  <p className="max-w-32 truncate text-sm font-bold text-slate-800">
                    {user.name || user.email}
                  </p>

                  <p className="text-xs capitalize text-slate-500">
                    {user.role || "User"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
              >
                <LogOut size={16} />
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-bold text-slate-700 transition hover:text-teal-700"
              >
                Sign In
              </Link>

              <Link href="/sign-up" className="btn-primary">
                Get Started
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-lg md:hidden">
          <div className="container-custom flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                className="py-2 text-sm font-semibold text-slate-700"
              >
                {link.name}
              </Link>
            ))}

            {isPending ? (
              <p className="py-2 text-sm text-slate-400">
                Checking session...
              </p>
            ) : isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <UserCircle className="text-teal-700" size={24} />

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      {user.role || "User"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="flex items-center gap-2 py-2 text-left text-sm font-bold text-red-600"
                >
                  <LogOut size={17} />
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={closeMenu}
                  className="py-2 text-sm font-semibold text-slate-700"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className="btn-primary w-full"
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
