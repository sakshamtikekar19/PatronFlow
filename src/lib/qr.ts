import QRCode from "qrcode";

const QR_OPTIONS = {
  margin: 2,
  width: 512,
  color: {
    dark: "#0A0A0A",
    light: "#FFFFFF",
  },
} as const;

/** Generate a PNG data URL for a QR code (for <img> display + PNG download). */
export async function generateQrDataUrl(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    margin: QR_OPTIONS.margin,
    width: QR_OPTIONS.width,
    color: QR_OPTIONS.color,
    errorCorrectionLevel: "M",
  });
}

/** Generate an SVG string for a QR code (for SVG download). */
export async function generateQrSvg(value: string): Promise<string> {
  return QRCode.toString(value, {
    type: "svg",
    margin: QR_OPTIONS.margin,
    color: QR_OPTIONS.color,
    errorCorrectionLevel: "M",
  });
}

/** Slugify a label for use in download filenames. */
export function slugifyFilename(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
