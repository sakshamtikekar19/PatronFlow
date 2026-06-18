"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword, type AuthResult } from "@/lib/actions/auth";

const initialState: AuthResult = {};

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePassword,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          New Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          className="h-11 rounded-xl border-border bg-card"
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-foreground">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
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
        {isPending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
