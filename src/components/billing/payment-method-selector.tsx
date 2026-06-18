"use client";

import { useState } from "react";
import { CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BillingProvider } from "@/lib/billing";

interface PaymentMethodSelectorProps {
  availableProviders: BillingProvider[];
  onSelect: (provider: BillingProvider) => void;
  isLoading?: boolean;
}

const providerConfig: Record<
  BillingProvider,
  { name: string; icon: typeof CreditCard; description: string }
> = {
  stripe: {
    name: "Card Payment",
    icon: CreditCard,
    description: "Pay with credit or debit card",
  },
  razorpay: {
    name: "UPI / Cards",
    icon: Smartphone,
    description: "Pay with UPI, cards, or net banking",
  },
  paypal: {
    name: "PayPal",
    icon: CreditCard,
    description: "Pay with your PayPal account",
  },
};

export function PaymentMethodSelector({
  availableProviders,
  onSelect,
  isLoading,
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<BillingProvider | null>(
    availableProviders[0] || null
  );

  if (availableProviders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          Payment methods are not yet configured. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {availableProviders.map((provider) => {
          const config = providerConfig[provider];
          const Icon = config.icon;

          return (
            <button
              key={provider}
              type="button"
              onClick={() => setSelected(provider)}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 text-left transition-colors",
                selected === provider
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  selected === provider
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{config.name}</p>
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>
              </div>
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2",
                  selected === provider
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected || isLoading}
        className="w-full"
      >
        {isLoading ? "Processing..." : "Continue to payment"}
      </Button>
    </div>
  );
}
