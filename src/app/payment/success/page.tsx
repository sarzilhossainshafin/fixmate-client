"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

type VerificationStatus = "loading" | "success" | "error";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState(
    "Please wait while we verify your payment."
  );

  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) return;

    verificationStarted.current = true;

    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        if (!sessionId) {
          throw new Error("Payment session ID was not found.");
        }

        const response = await api.get("/payments/verify", {
          params: {
            session_id: sessionId,
          },
        });

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Payment verification failed."
          );
        }

        setStatus("success");
        setMessage("Your payment has been verified successfully.");
      } catch (error: unknown) {
        console.error("Payment verification error:", error);

        let errorMessage = "Unable to verify your payment.";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setStatus("error");
        setMessage(errorMessage);
      }
    };

    verifyPayment();
  }, []);

  return (
    <section className="min-h-[65vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-base-300 bg-base-100 p-8 text-center shadow-xl">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-5 h-16 w-16 animate-spin text-primary" />

            <h1 className="mb-3 text-2xl font-bold">
              Verifying Your Payment
            </h1>

            <p className="text-base-content/70">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-success" />

            <h1 className="mb-3 text-3xl font-bold">
              Payment Successful!
            </h1>

            <p className="mb-8 text-base-content/70">{message}</p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard/customer/bookings"
                className="btn btn-primary"
              >
                View My Bookings
              </Link>

              <Link
                href="/dashboard/customer/payments"
                className="btn btn-outline"
              >
                Payment History
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="mx-auto mb-5 h-16 w-16 text-error" />

            <h1 className="mb-3 text-2xl font-bold">
              Payment Verification Failed
            </h1>

            <p className="mb-8 text-base-content/70">{message}</p>

            <Link
              href="/dashboard/customer/bookings"
              className="btn btn-primary"
            >
              Back to My Bookings
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
