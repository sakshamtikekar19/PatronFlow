import type { CustomerSegment, CustomerWithStats, SegmentedCustomer } from "@/types";

const AT_RISK_DAYS = 60;

/**
 * Classify a customer into a segment.
 * - At Risk: had activity but nothing in the last 60 days
 * - VIP: 5+ visits
 * - Regular: 2-4 visits
 * - New: exactly 1 visit
 */
export function classifyCustomer(
  customer: CustomerWithStats
): CustomerSegment {
  if (customer.last_visit) {
    const daysSince =
      (Date.now() - new Date(customer.last_visit).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSince > AT_RISK_DAYS && customer.visits > 0) {
      return "At Risk";
    }
  }

  if (customer.visits >= 5) return "VIP";
  if (customer.visits >= 2) return "Regular";
  return "New";
}

export function segmentCustomers(
  customers: CustomerWithStats[]
): SegmentedCustomer[] {
  return customers.map((customer) => ({
    ...customer,
    segment: classifyCustomer(customer),
  }));
}

export const SEGMENT_ORDER: CustomerSegment[] = [
  "VIP",
  "Regular",
  "New",
  "At Risk",
];

export const SEGMENT_DESCRIPTIONS: Record<CustomerSegment, string> = {
  VIP: "5+ visits",
  Regular: "2-4 visits",
  New: "1 visit",
  "At Risk": "No activity in 60+ days",
};
