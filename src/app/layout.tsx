import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "FixMate | Smart Repair Services",
    template: "%s | FixMate",
  },
  description:
    "Find trusted technicians and book reliable home appliance and device repair services with FixMate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar />

        <main className="min-h-[60vh]">
          {children}
        </main>

        <Footer />

        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}