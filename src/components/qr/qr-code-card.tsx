"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Copy, Check, QrCode as QrCodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateQrDataUrl, generateQrSvg, slugifyFilename } from "@/lib/qr";
import { cn } from "@/lib/utils";

interface QrCodeCardProps {
  /** The URL the QR code encodes. */
  url: string;
  /** Title shown above the QR (e.g. restaurant or table name). */
  title: string;
  subtitle?: string;
  /** Base filename for downloads. */
  filename: string;
  className?: string;
  compact?: boolean;
}

export function QrCodeCard({
  url,
  title,
  subtitle,
  filename,
  className,
  compact = false,
}: QrCodeCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(url).then((result) => {
      if (!cancelled) setDataUrl(result);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${slugifyFilename(filename)}-qr.png`;
    link.click();
  };

  const handleDownloadSvg = async () => {
    const svg = await generateQrSvg(url);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${slugifyFilename(filename)}-qr.svg`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available; ignore silently
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-100 bg-white",
            compact ? "h-36 w-36" : "h-44 w-44"
          )}
        >
          {dataUrl ? (
            <Image
              src={dataUrl}
              alt={`QR code for ${title}`}
              width={compact ? 144 : 176}
              height={compact ? 144 : 176}
              unoptimized
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <QrCodeIcon className="h-10 w-10 animate-pulse text-neutral-200" />
          )}
        </div>

        <div className="flex w-full flex-1 flex-col gap-3">
          <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
            <p className="break-all text-xs text-neutral-600">{url}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadPng}
              disabled={!dataUrl}
              className="rounded-xl border-neutral-200"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadSvg}
              className="rounded-xl border-neutral-200"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              SVG
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="rounded-xl border-neutral-200"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy URL
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
