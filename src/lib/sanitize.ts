/**
 * Input sanitization utilities to prevent XSS attacks.
 * Uses a simple allowlist approach that strips potentially dangerous content.
 */

/**
 * HTML entities that should be escaped in user input
 */
const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Remove potentially dangerous patterns from text input
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";

  return (
    input
      // Remove null bytes
      .replace(/\0/g, "")
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove on* event handlers
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
      // Remove javascript: URLs
      .replace(/javascript:/gi, "")
      // Remove data: URLs that could contain scripts
      .replace(/data:(?!image\/)/gi, "")
      // Escape HTML entities
      .replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char)
      // Trim whitespace
      .trim()
  );
}

/**
 * Sanitize a phone number - only allow digits, plus sign, dashes, spaces, and parentheses
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/[^0-9+\-() ]/g, "").trim();
}

/**
 * Sanitize an email address - basic cleanup without validation
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return "";
  return input.toLowerCase().trim();
}

/**
 * Sanitize a name - remove dangerous characters but allow common name characters
 */
export function sanitizeName(input: string | null | undefined): string {
  if (!input) return "";
  return (
    input
      // Remove anything that looks like HTML/script
      .replace(/<[^>]*>/g, "")
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, "")
      // Trim
      .trim()
  );
}

/**
 * Sanitize a comment or description - longer text that might contain
 * legitimate special characters but should not contain scripts
 */
export function sanitizeComment(input: string | null | undefined): string {
  if (!input) return "";

  return (
    input
      // Remove null bytes
      .replace(/\0/g, "")
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove on* event handlers
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
      // Remove javascript: URLs
      .replace(/javascript:/gi, "")
      // Remove HTML tags entirely (but keep the text content)
      .replace(/<[^>]*>/g, "")
      // Trim
      .trim()
  );
}

/**
 * Sanitize a URL - ensure it's a valid HTTP(S) URL
 */
export function sanitizeUrl(input: string | null | undefined): string | null {
  if (!input) return null;

  const trimmed = input.trim();

  // Only allow http:// and https:// URLs
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return null;
  }

  // Block javascript: and data: schemes even if they somehow got through
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Generic sanitizer that applies appropriate sanitization based on field type
 */
export function sanitizeInput(
  input: string | null | undefined,
  type: "text" | "phone" | "email" | "name" | "comment" | "url" = "text"
): string {
  switch (type) {
    case "phone":
      return sanitizePhone(input);
    case "email":
      return sanitizeEmail(input);
    case "name":
      return sanitizeName(input);
    case "comment":
      return sanitizeComment(input);
    case "url":
      return sanitizeUrl(input) ?? "";
    default:
      return sanitizeText(input);
  }
}
