"use client";

import { useState } from "react";
import { CreditCard, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionStatus } from "./subscription-status";
import { PaymentMethodSelector } from "./payment-method-selector";
import { InvoiceHistory } from "./invoice-history";
import { createCheckout, openBillingPortal, cancelCurrentSubscription } from "@/lib/actions/billing";
import { openRazorpaySubscriptionCheckout } from "@/components/billing/razorpay-checkout";
import { BILLING_CONFIG } from "@/lib/billing/config";
import { formatSubscriptionPrice } from "@/lib/billing/subscription-currency";
import type { SubscriptionCurrency } from "@/lib/billing/subscription-currency";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Subscription, Payment, Plan, SubscriptionStatus as SubStatusType } from "@/types/database.types";
import type { BillingProvider } from "@/lib/billing";

interface BillingPageClientProps {
  subscription: Subscription | null;
  plan: Plan | null;
  payments: Payment[];
  plans: Plan[];
  subscriptionStatus: {
    status: SubStatusType;
    isActive: boolean;
    trialDaysRemaining: number | null;
    subscription: Subscription | null;
  };
  availableProviders: BillingProvider[];
  checkoutCurrency: SubscriptionCurrency;
  userEmail: string;
  restaurantName: string;
}

export function BillingPageClient({
  subscription,
  plan,
  payments,
  plans,
  subscriptionStatus,
  availableProviders,
  checkoutCurrency,
  userEmail,
  restaurantName,
}: BillingPageClientProps) {
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalPending, setIsPortalPending] = useState(false);
  const [isCancelPending, setIsCancelPending] = useState(false);

  const handleUpgrade = async (provider: BillingProvider) => {
    if (provider === "razorpay") {
      setIsCheckoutLoading(true);
      try {
        const res = await fetch("/api/billing/razorpay-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currency: checkoutCurrency.toLowerCase() }),
        });
        const data = (await res.json()) as {
          subscriptionId?: string;
          key?: string;
          error?: string;
        };

        if (!res.ok || !data.subscriptionId || !data.key) {
          toast.error(data.error || "Failed to start Razorpay checkout");
          return;
        }

        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

        await openRazorpaySubscriptionCheckout({
          key: data.key,
          subscriptionId: data.subscriptionId,
          email: userEmail,
          name: restaurantName,
          callbackUrl: `${appUrl}/billing?success=true`,
          onError: (message) => toast.error(message),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Payment failed";
        if (message !== "Payment cancelled") {
          toast.error(message);
        }
      } finally {
        setIsCheckoutLoading(false);
      }
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const result = await createCheckout(provider);
      if (result?.error) {
        toast.error(result.error);
      }
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleManageSubscription = () => {
    setIsPortalPending(true);
    void (async () => {
      try {
        const result = await openBillingPortal();
        if (result.error) {
          toast.error(result.error);
        }
      } finally {
        setIsPortalPending(false);
      }
    })();
  };

  const handleCancelSubscription = () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.")) {
      return;
    }

    setIsCancelPending(true);
    void (async () => {
      try {
        const result = await cancelCurrentSubscription();
        if (result.success) {
          toast.success("Subscription will be cancelled at the end of the billing period");
        } else {
          toast.error(result.error || "Failed to cancel subscription");
        }
      } finally {
        setIsCancelPending(false);
      }
    })();
  };

  const currentPlan = plans[0]; // Single plan for now

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Current Plan */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Current Plan
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan?.name || currentPlan?.name || "PatronFlow Pro"}
              </p>
            </div>
            <SubscriptionStatus
              status={subscriptionStatus.status}
              trialDaysRemaining={subscriptionStatus.trialDaysRemaining}
              currentPeriodEnd={subscription?.current_period_end || null}
              cancelAtPeriodEnd={subscription?.cancel_at_period_end || false}
            />
          </div>

          {subscriptionStatus.status === "trialing" && (
            <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Calendar className="h-4 w-4" />
                <span>
                  Your trial ends on{" "}
                  {subscription?.trial_ends_at
                    ? formatDate(subscription.trial_ends_at)
                    : "soon"}
                </span>
              </div>
            </div>
          )}

          {subscription?.current_period_end &&
            subscriptionStatus.status === "active" && (
              <div className="mt-4 text-sm text-muted-foreground">
                Next billing date:{" "}
                {formatDate(subscription.current_period_end)}
              </div>
            )}

          <div className="mt-6 flex flex-wrap gap-3">
            {subscriptionStatus.status === "trialing" ||
            subscriptionStatus.status === "expired" ? (
              <Button onClick={() => setShowPaymentSelector(true)}>
                <Zap className="mr-2 h-4 w-4" />
                Upgrade now
              </Button>
            ) : subscriptionStatus.status === "active" ? (
              <>
                {subscription?.provider === "stripe" && (
                  <Button
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={isPortalPending}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isPortalPending ? "Loading..." : "Manage subscription"}
                  </Button>
                )}
                {!subscription?.cancel_at_period_end && (
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={isCancelPending}
                    className="text-destructive hover:text-destructive"
                  >
                    {isCancelPending ? "Cancelling..." : "Cancel subscription"}
                  </Button>
                )}
              </>
            ) : subscriptionStatus.status === "past_due" ? (
              <Button onClick={() => setShowPaymentSelector(true)}>
                Update payment method
              </Button>
            ) : null}
          </div>
        </div>

        {/* Payment Method Selector */}
        {showPaymentSelector && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Choose payment method
            </h3>
            <PaymentMethodSelector
              availableProviders={availableProviders}
              onSelect={handleUpgrade}
              isLoading={isCheckoutLoading}
            />
          </div>
        )}

        {/* Payment History */}
        <InvoiceHistory payments={payments} />
      </div>

      {/* Plan Features */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            {currentPlan?.name || "PatronFlow Pro"}
          </h3>
          <div className="mt-2">
            <span className="text-3xl font-bold text-foreground">
              {formatSubscriptionPrice(checkoutCurrency)}
            </span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {checkoutCurrency === "INR"
              ? "India pricing (₹4,999/month)"
              : "International pricing ($99/month)"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {currentPlan?.description ||
              "All features included. No hidden fees."}
          </p>
          <ul className="mt-4 space-y-2">
            {(currentPlan?.features || BILLING_CONFIG.plans[0].features).map(
              (feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                    ✓
                  </span>
                  {feature}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Trial Info */}
        {subscriptionStatus.status === "trialing" && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h3 className="font-semibold text-blue-900">
              {BILLING_CONFIG.trialDays}-day free trial
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Try all features free for {BILLING_CONFIG.trialDays} days. No
              credit card required. Cancel anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
