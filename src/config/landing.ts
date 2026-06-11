/**
 * Landing page content + CTA configuration.
 * Centralised so copy/links are never hardcoded across section components.
 */

export const WHATSAPP_PHONE = "8454069522";
export const WHATSAPP_PHONE_DISPLAY = "+91 84540 69522";
export const WHATSAPP_URL =
  "https://wa.me/918454069522?text=Hi%20PatronFlow%2C%20I%20would%20like%20to%20know%20more%20about%20growing%20my%20restaurant.";

export const PRIMARY_CTA_LABEL = "Contact on WhatsApp";

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Contact", href: "#contact" },
] as const;

export const HERO = {
  headline: "Turn Guests Into Loyal Patrons.",
  subheadline:
    "PatronFlow helps restaurants collect customer feedback, increase Google reviews, recover unhappy guests, build customer loyalty, and grow repeat business from one platform.",
} as const;

export interface Metric {
  value: number;
  suffix: string;
  label: string;
}

export const SOCIAL_PROOF: Metric[] = [
  { value: 5000, suffix: "+", label: "Guest Feedback Collected" },
  { value: 1200, suffix: "+", label: "Google Reviews Generated" },
  { value: 3000, suffix: "+", label: "Customer Profiles Managed" },
  { value: 35, suffix: "%", label: "Increase In Repeat Visits" },
];

export const PROBLEM_FLOW = [
  "Customer Visits",
  "Enjoys Meal",
  "Leaves Restaurant",
  "Restaurant Loses Relationship",
] as const;

export const PROBLEMS = [
  "No customer database",
  "No loyalty system",
  "No repeat visit strategy",
  "Negative reviews appear unexpectedly",
  "No customer retention process",
] as const;

export const SOLUTION_FLOW = [
  { label: "QR Code", icon: "qr" },
  { label: "Feedback", icon: "message" },
  { label: "Google Reviews", icon: "star" },
  { label: "Customer CRM", icon: "users" },
  { label: "Loyalty Rewards", icon: "gift" },
  { label: "Repeat Visits", icon: "repeat" },
] as const;

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export const FEATURES: Feature[] = [
  {
    title: "Google Review Growth",
    description: "Convert happy guests into public reviews.",
    icon: "star",
  },
  {
    title: "Feedback Management",
    description: "Capture issues before they become negative reviews.",
    icon: "message",
  },
  {
    title: "Customer CRM",
    description: "Build a customer database automatically.",
    icon: "users",
  },
  {
    title: "Guest Recovery",
    description: "Recover unhappy customers before losing them.",
    icon: "heart",
  },
  {
    title: "Loyalty Program",
    description: "Encourage repeat visits through rewards.",
    icon: "gift",
  },
  {
    title: "Event Management",
    description: "Promote events and collect RSVPs.",
    icon: "calendar",
  },
  {
    title: "Analytics Dashboard",
    description: "Monitor restaurant growth.",
    icon: "chart",
  },
  {
    title: "Smart Notifications",
    description: "Get notified about VIP guests, birthdays, and complaints.",
    icon: "bell",
  },
];

export const SHOWCASE = [
  {
    title: "Analytics Dashboard",
    image: "/landing/analytics.png",
    icon: "chart",
  },
  {
    title: "Customer CRM",
    image: "/landing/customers.png",
    icon: "users",
  },
  {
    title: "Feedback Management",
    image: "/landing/feedback.png",
    icon: "message",
  },
  {
    title: "Loyalty & Events",
    image: "/landing/loyalty.png",
    icon: "gift",
  },
] as const;

export const HERO_IMAGE = "/landing/dashboard.png";

export const ADVANTAGES_WITH = [
  "More Google Reviews",
  "Better Online Reputation",
  "Build Customer Database",
  "Higher Repeat Visits",
  "Loyalty Automation",
  "Event Promotion",
  "Guest Recovery",
  "Real-Time Business Insights",
] as const;

export const ADVANTAGES_WITHOUT = [
  "Lost Customer Relationships",
  "Fewer Reviews",
  "No Guest Recovery",
  "No Loyalty Program",
  "No Customer Database",
  "Limited Business Insights",
] as const;

export const ROI_METRICS: Metric[] = [
  { value: 35, suffix: "%", label: "Increase In Repeat Visits" },
  { value: 40, suffix: "%", label: "More Customer Data Captured" },
  { value: 25, suffix: "%", label: "Review Growth" },
  { value: 30, suffix: "%", label: "Higher Customer Retention" },
];

export const ROI_DISCLAIMER =
  "Results may vary by restaurant size and implementation.";

export interface Testimonial {
  role: string;
  quote: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    role: "Restaurant Owner",
    quote:
      "PatronFlow helped us better understand our guests and improve our review generation.",
  },
  {
    role: "Restaurant Manager",
    quote:
      "We now have visibility into customer feedback and repeat visits.",
  },
  {
    role: "Cafe Owner",
    quote: "The loyalty system helped us increase customer retention.",
  },
];
