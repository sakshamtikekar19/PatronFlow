import { generateQrDataUrl } from "@/lib/qr";
import { BRAND } from "@/config/branding";

interface PosterOptions {
  restaurantName: string;
  url: string;
  restaurantLogo?: string | null;
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
  restaurantLogo,
  headline = "Enjoyed your visit?",
  subtext = "Scan to share your feedback",
}: PosterOptions): Promise<void> {
  const dataUrl = await generateQrDataUrl(url);
  // The new window starts as about:blank with no base URL, so app-relative
  // asset paths must be made absolute against the current origin.
  const brandLogo = `${window.location.origin}/patronflowlogo.png`;

  const restaurantLogoBlock = restaurantLogo
    ? `<img class="rlogo" src="${restaurantLogo}" alt="${restaurantName} logo" />`
    : "";

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
        padding: 56px 56px 40px;
        text-align: center;
        max-width: 640px;
        width: 100%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      }
      .rlogo { width: 88px; height: 88px; object-fit: cover; border-radius: 20px; margin: 0 auto 16px; display: block; }
      .name { font-size: 28px; font-weight: 600; color: #0a0a0a; margin-bottom: 8px; }
      .headline { font-size: 40px; font-weight: 700; color: #0a0a0a; margin: 24px 0 8px; }
      .subtext { font-size: 18px; color: #6b7280; margin-bottom: 32px; }
      .qr { width: 320px; height: 320px; margin: 0 auto; }
      .qr img { width: 100%; height: 100%; }
      .footer { margin-top: 36px; padding-top: 24px; border-top: 1px solid #f0f0f0; }
      .footer .poweredby { font-size: 12px; color: #9ca3af; margin-bottom: 8px; letter-spacing: 0.04em; text-transform: uppercase; }
      .footer .brand { height: 34px; width: auto; }
      @media print { body { background: #fff; padding: 0; } .poster { box-shadow: none; } }
    </style>
  </head>
  <body>
    <div class="poster">
      ${restaurantLogoBlock}
      <div class="name">${restaurantName}</div>
      <div class="headline">${headline}</div>
      <div class="subtext">${subtext}</div>
      <div class="qr"><img src="${dataUrl}" alt="Feedback QR code" /></div>
      <div class="footer">
        <div class="poweredby">Powered by</div>
        <img class="brand" src="${brandLogo}" alt="${BRAND.name}" />
      </div>
    </div>
    <script>
      window.onload = function () { window.print(); };
    </script>
  </body>
</html>`);
  win.document.close();
}
