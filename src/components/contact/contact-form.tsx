"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitSupportRequest } from "@/lib/actions/support";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitSupportRequest({
        type: "contact",
        name,
        email,
        subject,
        message,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Message sent. We'll get back to you soon.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto mt-10 w-full max-w-xl space-y-4 text-left"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name" className="text-neutral-200">
            Name
          </Label>
          <Input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="h-11 rounded-xl border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-neutral-200">
            Email
          </Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@restaurant.com"
            className="h-11 rounded-xl border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-subject" className="text-neutral-200">
          Subject
        </Label>
        <Input
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          placeholder="How can we help?"
          className="h-11 rounded-xl border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message" className="text-neutral-200">
          Message
        </Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          placeholder="Tell us about your restaurant or question..."
          className="rounded-xl border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-xl bg-white text-neutral-900 hover:bg-neutral-100"
      >
        {pending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
