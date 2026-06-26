"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthResult } from "@/lib/actions/auth";

interface AuthFormProps {
  mode: "login" | "signup";
  action: (prevState: AuthResult, formData: FormData) => Promise<AuthResult>;
}

const initialState: AuthResult = {};

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="restaurant_name" className="text-foreground">
            Restaurant Name
          </Label>
          <Input
            id="restaurant_name"
            name="restaurant_name"
            placeholder="The Golden Fork"
            required
            className="h-11 rounded-xl border-border bg-card"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@restaurant.com"
          required
          className="h-11 rounded-xl border-border bg-card"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-foreground">
            Password
          </Label>
          {mode === "login" && (
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={mode === "signup" ? 8 : 6}
          className="h-11 rounded-xl border-border bg-card"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {state.success && state.message && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
      >
        {isPending
          ? "Please wait..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
