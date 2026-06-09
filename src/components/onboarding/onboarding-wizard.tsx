"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Printer,
  Download,
  ExternalLink,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrCodeCard } from "@/components/qr/qr-code-card";
import { CUISINE_TYPES } from "@/types";
import { saveOnboardingDetails, completeOnboarding } from "@/lib/actions/onboarding";
import { uploadRestaurantLogo } from "@/lib/actions/settings";
import { printQrPoster } from "@/lib/print-poster";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/branding";
import type { Restaurant } from "@/types";

interface OnboardingWizardProps {
  restaurant: Restaurant;
  reviewUrl: string;
}

const STEPS = ["Restaurant", "Google Profile", "QR Code", "Done"];

export function OnboardingWizard({
  restaurant,
  reviewUrl,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(restaurant.name ?? "");
  const [cuisineType, setCuisineType] = useState(restaurant.cuisine_type ?? "");
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    restaurant.google_review_url ?? ""
  );
  const [logoUrl, setLogoUrl] = useState(restaurant.logo ?? "");
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("logo", file);
    const result = await uploadRestaurantLogo(formData);
    if (result.error) setError(result.error);
    else if (result.logoUrl) setLogoUrl(result.logoUrl);
    setIsUploading(false);
  };

  const persist = (next: number) => {
    setError(null);
    startTransition(async () => {
      const result = await saveOnboardingDetails({
        name,
        cuisineType,
        googleReviewUrl,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setStep(next);
    });
  };

  const handleNext = () => {
    if (step === 0) {
      if (!name.trim()) {
        setError("Restaurant name is required");
        return;
      }
      persist(1);
    } else if (step === 1) {
      persist(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFinish = () => {
    startTransition(async () => {
      await completeOnboarding();
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 flex justify-center">
        <Image
          src="/patronflowlogo.png"
          alt={`${BRAND.name} — ${BRAND.tagline}`}
          width={220}
          height={147}
          priority
          className="h-auto w-44"
        />
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                i < step && "bg-neutral-900 text-white",
                i === step && "bg-neutral-900 text-white",
                i > step && "bg-neutral-200 text-neutral-500"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 rounded-full",
                  i < step ? "bg-neutral-900" : "bg-neutral-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {/* Step 1: Restaurant info */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Tell us about your restaurant
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                This appears on your feedback page.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="The Corner Bistro"
                className="h-11 rounded-xl border-neutral-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Select
                value={cuisineType}
                onValueChange={(v) => v && setCuisineType(v)}
              >
                <SelectTrigger
                  id="cuisine"
                  className="h-11 rounded-xl border-neutral-200"
                >
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {CUISINE_TYPES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    width={56}
                    height={56}
                    unoptimized
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 text-lg font-medium text-neutral-400">
                    {name.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <span className="inline-flex h-10 items-center rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Uploading..." : "Upload logo"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Google profile */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Connect your review experience
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Happy guests (4-5 stars) will be sent here to leave a public
                review and become loyal patrons.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="google">Google Review URL</Label>
              <Input
                id="google"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://g.page/r/..."
                className="h-11 rounded-xl border-neutral-200"
              />
              <p className="text-xs text-neutral-400">
                You can add or change this later in Settings.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: QR code */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Generate your {BRAND.name} QR
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Place this where guests can scan it. You can make table-specific
                codes later.
              </p>
            </div>
            <QrCodeCard
              url={reviewUrl}
              title={name || restaurant.name}
              subtitle="Main feedback link"
              filename={name || restaurant.name}
              compact
            />
          </div>
        )}

        {/* Step 4: Success */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <PartyPopper className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                You&apos;re all set!
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {name || restaurant.name} is ready to start collecting feedback
                and growing customer loyalty.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  printQrPoster({
                    restaurantName: name || restaurant.name,
                    url: reviewUrl,
                  })
                }
                className="h-11 rounded-xl border-neutral-200"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print QR Poster
              </Button>
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Feedback Page
              </a>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 && step < 3 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={isPending}
              className="text-neutral-500"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isPending || isUploading}
              className="h-11 rounded-xl bg-neutral-900 px-6 text-white hover:bg-neutral-800"
            >
              {step === 2 ? "Continue" : "Next"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinish}
              disabled={isPending}
              className="ml-auto h-11 rounded-xl bg-neutral-900 px-6 text-white hover:bg-neutral-800"
            >
              {isPending ? "Finishing..." : "Go to Dashboard"}
              <Download className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleFinish}
          disabled={isPending}
          className="text-sm text-neutral-400 hover:text-neutral-600"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
