"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Bug, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitSupportRequest } from "@/lib/actions/support";

interface SupportReportFormProps {
  restaurantId: string;
  restaurantName: string;
  userEmail?: string;
}

export function SupportReportForm({
  restaurantId,
  restaurantName,
  userEmail,
}: SupportReportFormProps) {
  const [type, setType] = useState<"bug" | "feature">("bug");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitSupportRequest({
        type,
        name: restaurantName,
        email: userEmail ?? "",
        subject,
        message,
        restaurantId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        type === "bug"
          ? "Bug report submitted. We'll look into it."
          : "Feature request submitted. Thank you!"
      );
      setSubject("");
      setMessage("");
    });
  }

  return (
    <div className="space-y-6 rounded-2xl bg-card p-6 shadow-card">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Report a bug or request a feature
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Submissions go directly to the PatronFlow team.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={type === "bug" ? "default" : "outline"}
          onClick={() => setType("bug")}
          className="rounded-xl"
        >
          <Bug className="mr-2 h-4 w-4" />
          Bug report
        </Button>
        <Button
          type="button"
          variant={type === "feature" ? "default" : "outline"}
          onClick={() => setType("feature")}
          className="rounded-xl"
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          Feature request
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="support-subject">Subject</Label>
          <Input
            id="support-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder={
              type === "bug"
                ? "Brief description of the issue"
                : "What would you like us to build?"
            }
            className="h-11 rounded-xl border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support-message">Details</Label>
          <Textarea
            id="support-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            placeholder={
              type === "bug"
                ? "Steps to reproduce, what you expected, and what happened..."
                : "Describe the feature and how it would help your restaurant..."
            }
            className="rounded-xl border-border"
          />
        </div>
        <Button
          type="submit"
          disabled={pending || !userEmail}
          className="rounded-xl"
        >
          {pending ? "Submitting..." : "Submit to PatronFlow"}
        </Button>
        {!userEmail && (
          <p className="text-sm text-muted-foreground">
            Sign in with an email address to submit reports.
          </p>
        )}
      </form>
    </div>
  );
}
