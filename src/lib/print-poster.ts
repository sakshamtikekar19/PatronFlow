import { generateQrDataUrl } from "@/lib/qr";
import { BRAND } from "@/config/branding";

interface PosterOptions {
  restaurantName: string;
  url: string;
  headline?: string;
  subtext?: string;
}

/**
 * Opens a print-ready QR poster in a new window and triggers the print dialog.
 * Runs only in the browser.
 */
export async function printQrPoster({
  restaurantName,
  url,
  headline = "Enjoyed your visit?",
  subtext = "Scan to share your feedback",
}: PosterOptions): Promise<void> {
  const dataUrl = await generateQrDataUrl(url);

  const win = window.open("", "_blank", "width=800,height=1000");
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>${restaurantName} — Feedback QR Poster</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        background: #F5F2ED;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 48px;
      }
      .poster {
        background: #fff;
        border-radius: 32px;
        padding: 64px 56px;
        text-align: center;
        max-width: 640px;
        width: 100%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      }
      .name { font-size: 28px; font-weight: 600; color: #0a0a0a; margin-bottom: 8px; }
      .headline { font-size: 40px; font-weight: 700; color: #0a0a0a; margin: 24px 0 8px; }
      .subtext { font-size: 18px; color: #6b7280; margin-bottom: 32px; }
      .qr { width: 320px; height: 320px; margin: 0 auto; }
      .qr img { width: 100%; height: 100%; }
      .footer { margin-top: 32px; font-size: 14px; color: #9ca3af; }
      @media print { body { background: #fff; padding: 0; } .poster { box-shadow: none; } }
    </style>
  </head>
  <body>
    <div class="poster">
      <div class="name">${restaurantName}</div>
      <div class="headline">${headline}</div>
      <div class="subtext">${subtext}</div>
      <div class="qr"><img src="${dataUrl}" alt="Feedback QR code" /></div>
      <div class="footer">Powered by ${BRAND.name}</div>
    </div>
    <script>
      window.onload = function () { window.print(); };
    </script>
  </body>
</html>`);
  win.document.close();
}
