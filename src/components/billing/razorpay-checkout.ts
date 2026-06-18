"use client";

import { BRAND } from "@/config/branding";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: RazorpayFailureResponse) => void) => void;
    };
  }
}

interface RazorpayFailureResponse {
  error?: {
    description?: string;
    reason?: string;
  };
}

let scriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve) => {
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(!!window.Razorpay));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpaySubscriptionCheckout(params: {
  key: string;
  subscriptionId: string;
  email: string;
  name?: string;
  callbackUrl: string;
  onError?: (message: string) => void;
}): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error(
      "Could not load Razorpay checkout. Check your connection or ad blocker."
    );
  }

  const rzp = new window.Razorpay({
    key: params.key,
    subscription_id: params.subscriptionId,
    name: BRAND.name,
    description: `${BRAND.name} Pro — monthly subscription`,
    image: `${window.location.origin}/patronflowlogo.png`,
    callback_url: params.callbackUrl,
    prefill: {
      email: params.email,
      name: params.name || params.email.split("@")[0],
    },
    theme: { color: "#171717" },
    handler: () => {
      window.location.assign(params.callbackUrl);
    },
  });

  rzp.on("payment.failed", (response) => {
    const message =
      response.error?.description ||
      response.error?.reason ||
      "Payment failed. Please try again.";
    params.onError?.(message);
  });

  rzp.open();
}
