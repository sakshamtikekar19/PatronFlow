import { generateQrDataUrl, slugifyFilename } from "@/lib/qr";
import { BRAND } from "@/config/branding";

interface PosterOptions {
  restaurantName: string;
  url: string;
  restaurantLogo?: string | null;
  headline?: string;
  subtext?: string;
}

// Intrinsic size of the trimmed PatronFlow wordmark (public/patronflowlogo.png).
const BRAND_LOGO_RATIO = 1297 / 375;

const FONT_STACK =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Load via blob URL so cross-origin images (e.g. Supabase storage logos) don't
// taint the canvas and block toBlob().
async function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  try {
    const res = await fetch(src, { mode: "cors" });
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      return await loadImage(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return null;
  }
}

/**
 * Renders the QR poster to a canvas and downloads it as a PNG image.
 * Runs only in the browser.
 */
export async function downloadQrPoster({
  restaurantName,
  url,
  restaurantLogo,
  headline = "Enjoyed your visit?",
  subtext = "Scan to share your feedback",
}: PosterOptions): Promise<void> {
  const qrDataUrl = await generateQrDataUrl(url);

  const scale = 2;
  const W = 720;
  const H = 960;
  const centerX = W / 2;

  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Cream background + white card.
  ctx.fillStyle = "#F5F2ED";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  roundRectPath(ctx, 40, 40, W - 80, H - 80, 28);
  ctx.fill();

  const [qrImg, brandImg, rLogoImg] = await Promise.all([
    loadImage(qrDataUrl),
    loadImageSafe(`${window.location.origin}/patronflowlogo.png`),
    restaurantLogo ? loadImageSafe(restaurantLogo) : Promise.resolve(null),
  ]);

  let y = 110;

  if (rLogoImg) {
    const size = 92;
    ctx.save();
    roundRectPath(ctx, centerX - size / 2, y, size, size, 20);
    ctx.clip();
    ctx.drawImage(rLogoImg, centerX - size / 2, y, size, size);
    ctx.restore();
    y += size + 34;
  }

  ctx.fillStyle = "#0a0a0a";
  ctx.font = `600 30px ${FONT_STACK}`;
  ctx.fillText(restaurantName, centerX, y);
  y += 50;

  ctx.font = `700 42px ${FONT_STACK}`;
  ctx.fillText(headline, centerX, y);
  y += 40;

  ctx.fillStyle = "#6b7280";
  ctx.font = `400 19px ${FONT_STACK}`;
  ctx.fillText(subtext, centerX, y);
  y += 46;

  const qrSize = 320;
  ctx.drawImage(qrImg, centerX - qrSize / 2, y, qrSize, qrSize);
  y += qrSize + 40;

  ctx.strokeStyle = "#f0f0f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(130, y);
  ctx.lineTo(W - 130, y);
  ctx.stroke();
  y += 28;

  ctx.fillStyle = "#9ca3af";
  ctx.font = `600 12px ${FONT_STACK}`;
  ctx.fillText("POWERED BY", centerX, y);
  y += 16;

  if (brandImg) {
    const bw = 188;
    const bh = bw / BRAND_LOGO_RATIO;
    ctx.drawImage(brandImg, centerX - bw / 2, y, bw, bh);
  }

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png")
  );
  if (!blob) return;

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${slugifyFilename(restaurantName)}-feedback-poster.png`;
  link.click();
  URL.revokeObjectURL(objectUrl);
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
