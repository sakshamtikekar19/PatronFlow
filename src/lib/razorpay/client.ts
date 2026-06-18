import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

/**
 * Get the Razorpay client instance.
 * Returns null if Razorpay is not configured.
 */
export function getRazorpayClient(): Razorpay | null {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
}

/**
 * Check if Razorpay is configured
 */
export function isRazorpayConfigured(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
