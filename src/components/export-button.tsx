"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExportButtonProps {
  /** API endpoint that returns a CSV (e.g. /api/export/customers). */
  endpoint: string;
  label?: string;
}

export function ExportButton({ endpoint, label = "Export CSV" }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString();
      const res = await fetch(`${endpoint}${qs ? `?${qs}` : ""}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="(.+)"/);
      link.download = match?.[1] ?? "export.csv";
      link.click();
      URL.revokeObjectURL(url);
      setOpen(false);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-border"
          />
        }
      >
        <Download className="mr-2 h-4 w-4" />
        {label}
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Export CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Optionally filter by date range. Leave blank to export everything.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-10 rounded-xl border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-10 rounded-xl border-border"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
          >
            {downloading ? "Preparing..." : "Download CSV"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
