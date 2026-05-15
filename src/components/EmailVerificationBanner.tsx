import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { cn } from "../utlis/cn";
import toast from "react-hot-toast";
import { EnvelopeIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function EmailVerificationBanner() {
  const [show, setShow] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Check if user email is verified
    async function checkStatus() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Show banner only if email is NOT verified
        if (res.data && res.data.isEmailVerified === false) {
          setShow(true);
        }
      } catch {
        // Silently fail — don't show banner if we can't check
      }
    }
    checkStatus();
  }, []);

  async function handleResend() {
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BACKEND_URL}/api/v1/auth/send-verification`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Failed to send verification email.");
    } finally {
      setSending(false);
    }
  }

  if (!show) return null;

  return (
    <div
      className={cn(
        "w-full py-2.5 px-4 text-center text-sm",
        "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
        "border-b border-amber-200 dark:border-amber-800/30",
        "text-amber-800 dark:text-amber-200"
      )}
    >
      <EnvelopeIcon className="inline-block w-4 h-4 mr-1 align-text-bottom" /> Please verify your email address.{" "}
      <button
        onClick={handleResend}
        disabled={sending}
        className="font-semibold underline hover:no-underline disabled:opacity-50"
      >
        {sending ? "Sending..." : "Resend verification email"}
      </button>
      <button
        onClick={() => setShow(false)}
        className="ml-3 text-amber-600 dark:text-amber-400 hover:opacity-70"
        title="Dismiss"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
