"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ImageIcon,
  Upload,
  Trash2,
  Store,
  Palette,
  QrCode,
  User,
  AlertTriangle,
  Printer,
  ArrowRight,
  LogOut,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  updateRestaurantSettings,
  uploadRestaurantLogo,
  removeRestaurantLogo,
  deleteAccount,
} from "@/lib/actions/settings";
import { logout } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { printQrPoster } from "@/lib/print-poster";
import { CUISINE_TYPES } from "@/types";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@/types";

const settingsSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  google_review_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsTabsProps {
  restaurant: Restaurant;
  reviewUrl: string;
  userEmail?: string;
}

const TABS = [
  { id: "restaurant", label: "Restaurant", icon: Store },
  { id: "brand", label: "Brand", icon: Palette },
  { id: "qr", label: "QR", icon: QrCode },
  { id: "account", label: "Account", icon: User },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsTabs({
  restaurant,
  reviewUrl,
  userEmail,
}: SettingsTabsProps) {
  const [tab, setTab] = useState<TabId>("restaurant");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [cuisineType, setCuisineType] = useState(restaurant.cuisine_type ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(restaurant.logo);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: restaurant.name,
      google_review_url: restaurant.google_review_url ?? "",
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setMessage(null);
    const result = await updateRestaurantSettings({
      ...data,
      cuisine_type: cuisineType,
    });
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      toast.error(result.error);
    } else {
      setMessage({ type: "success", text: "Settings saved successfully." });
      toast.success("Settings saved");
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("logo", file);
    const result = await uploadRestaurantLogo(formData);
    setIsUploading(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      toast.error(result.error);
    } else if (result.logoUrl) {
      setLogoUrl(result.logoUrl);
      setMessage({ type: "success", text: "Logo updated." });
      toast.success("Logo updated");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveLogo = async () => {
    setMessage(null);
    setIsUploading(true);
    const result = await removeRestaurantLogo();
    setIsUploading(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      toast.error(result.error);
    } else {
      setLogoUrl(null);
      setMessage({ type: "success", text: "Logo removed." });
      toast.success("Logo removed");
    }
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Tab nav */}
      <nav className="flex gap-1 overflow-x-auto md:w-48 md:flex-col">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setMessage(null);
            }}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                : "text-neutral-500 hover:text-neutral-900",
              id === "danger" && tab === id && "text-red-600"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="flex-1 space-y-6">
        {/* Restaurant */}
        {tab === "restaurant" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5 rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="h-11 rounded-xl border-neutral-200"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
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
                <Label htmlFor="google_review_url">Google Review URL</Label>
                <Input
                  id="google_review_url"
                  {...register("google_review_url")}
                  placeholder="https://g.page/r/your-restaurant/review"
                  className="h-11 rounded-xl border-neutral-200"
                />
                {errors.google_review_url && (
                  <p className="text-sm text-red-600">
                    {errors.google_review_url.message}
                  </p>
                )}
                <p className="text-xs text-neutral-500">
                  Customers with 4+ star ratings will be redirected here.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-xl bg-neutral-900 px-6 text-white hover:bg-neutral-800"
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        )}

        {/* Brand */}
        {tab === "brand" && (
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Restaurant Logo
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Appears in your dashboard and on your review page.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={restaurant.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-7 w-7 text-neutral-300" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-neutral-200"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading
                    ? "Uploading..."
                    : logoUrl
                      ? "Change logo"
                      : "Upload logo"}
                </Button>
                {logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isUploading}
                    onClick={handleRemoveLogo}
                    className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
                <p className="w-full text-xs text-neutral-400">
                  PNG, JPG, WEBP or SVG. Max 2MB.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* QR */}
        {tab === "qr" && (
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Your Review Link
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Share this link or its QR code with customers.
              </p>
            </div>
            <code className="block break-all rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {reviewUrl}
            </code>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  printQrPoster({ restaurantName: restaurant.name, url: reviewUrl })
                }
                className="rounded-xl border-neutral-200"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print QR Poster
              </Button>
              <Button
                render={<Link href="/qr" />}
                className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Manage QR Codes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Account */}
        {tab === "account" && (
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Account</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Your login details.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={userEmail ?? ""}
                readOnly
                disabled
                className="h-11 rounded-xl border-neutral-200 bg-neutral-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Appearance</Label>
              <div>
                <ThemeToggle />
              </div>
            </div>
            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                className="rounded-xl border-neutral-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        {tab === "danger" && (
          <div className="space-y-4 rounded-2xl border border-red-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div>
              <h3 className="text-sm font-semibold text-red-600">
                Delete Account
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Permanently delete your account, restaurant, customers, and all
                feedback. This cannot be undone.
              </p>
            </div>
            <DeleteAccountDialog />
          </div>
        )}

        {message && (
          <p
            className={cn(
              "rounded-xl px-4 py-3 text-sm",
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            )}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) setError(result.error);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
          />
        }
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete my account
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete account?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-neutral-500">
            Type <span className="font-semibold text-neutral-900">DELETE</span> to
            confirm. This permanently removes all your data.
          </p>
          <Input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            className="h-11 rounded-xl border-neutral-200"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="button"
            disabled={confirm !== "DELETE" || isPending}
            onClick={handleDelete}
            className="h-11 w-full rounded-xl bg-red-600 text-white hover:bg-red-700"
          >
            {isPending ? "Deleting..." : "Permanently delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
