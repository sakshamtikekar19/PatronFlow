import type {
  Customer,
  Feedback,
  FeedbackCategory,
  RecoveryStatus,
  Event,
  LoyaltyTransactionType,
} from "./database.types";

export type {
  Customer,
  Feedback,
  FeedbackCategory,
  FeedbackStatus,
  Restaurant,
  TableQr,
  CustomerVisit,
  LoyaltyTransaction,
  LoyaltyRule,
  LoyaltyTransactionType,
  Event,
  EventRsvp,
  EventStatus,
  RecoveryStatus,
} from "./database.types";

export interface CustomerWithStats extends Customer {
  visits: number;
  average_rating: number;
  last_visit: string | null;
}

export interface FeedbackWithCustomer extends Feedback {
  customer: Pick<Customer, "id" | "name" | "phone" | "email">;
}

export interface DashboardStats {
  averageRating: number;
  totalFeedback: number;
  totalCustomers: number;
  positiveFeedbackPercent: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  label: string;
}

export interface FeedbackTrend {
  date: string;
  count: number;
}

export interface PublicFeedbackSubmission {
  name: string;
  phone: string;
  rating: number;
  comment?: string;
  category?: FeedbackCategory;
  tableName?: string;
  source?: string;
}

export interface TableQrAnalytics {
  tableName: string;
  feedbackCount: number;
  reviewCount: number;
  averageRating: number;
}

export type CustomerSegment = "VIP" | "Regular" | "New" | "At Risk";

export interface SegmentedCustomer extends CustomerWithStats {
  segment: CustomerSegment;
}

export interface SegmentSummary {
  segment: CustomerSegment;
  count: number;
  customers: SegmentedCustomer[];
}

export interface TrendComparison {
  current: number;
  previous: number;
  changePercent: number;
}

export interface RestaurantInsights {
  mostCommonComplaint: { category: FeedbackCategory; count: number } | null;
  mostMentionedPositive: { category: FeedbackCategory; count: number } | null;
  highestRatedCategory: { category: FeedbackCategory; average: number } | null;
  lowestRatedCategory: { category: FeedbackCategory; average: number } | null;
  weeklyFeedback: TrendComparison;
  monthlyFeedback: TrendComparison;
}

export type NotificationType =
  | "negative_feedback"
  | "new_customer"
  | "vip"
  | "birthday";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
}

export interface ReviewFunnel {
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  reviewClicks: number;
  positivePercent: number;
  negativePercent: number;
  conversionRate: number;
}

export interface PublicFeedbackResponse {
  success: boolean;
  showGoogleReview: boolean;
  googleReviewUrl?: string | null;
  message: string;
  feedbackId?: string;
}

export const CUISINE_TYPES = [
  "American",
  "Italian",
  "Mexican",
  "Chinese",
  "Indian",
  "Japanese",
  "Thai",
  "Mediterranean",
  "French",
  "Korean",
  "Cafe / Bakery",
  "Fast Food",
  "Seafood",
  "Steakhouse",
  "Vegan / Vegetarian",
  "Other",
] as const;

// ============================================================
// Phase 2 domain types
// ============================================================

// --- Guest Recovery ---
export interface RecoveryCase extends Feedback {
  customer: Pick<Customer, "id" | "name" | "phone" | "email">;
}

export interface RecoveryAnalytics {
  totalNegative: number;
  recovered: number;
  recoveryRate: number;
  openCases: number;
  contacted: number;
}

// --- Loyalty ---
export interface LoyaltyStats {
  activeMembers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  outstandingPoints: number;
  rewardCount: number;
}

export interface LoyaltyCustomer extends Customer {
  totalPoints: number;
  pointsEarned: number;
  pointsRedeemed: number;
}

export interface LoyaltyTransactionWithCustomer {
  id: string;
  points: number;
  transaction_type: LoyaltyTransactionType;
  notes: string | null;
  created_at: string;
  customerName: string;
  customerPhone: string | null;
}

export interface CustomerLoyaltySummary {
  totalPoints: number;
  pointsEarned: number;
  pointsRedeemed: number;
  eligibleRewards: { id: string; reward_name: string; points_required: number }[];
}

// --- Visits ---
export interface VisitMetrics {
  totalVisits: number;
  uniqueCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
  averageVisitsPerCustomer: number;
}

// --- Customer Insights Engine ---
export interface CustomerInsights {
  mostCommonComplaint: { category: FeedbackCategory; count: number } | null;
  mostLovedCategory: { category: FeedbackCategory; count: number } | null;
  highestRatedCategory: { category: FeedbackCategory; average: number } | null;
  lowestRatedCategory: { category: FeedbackCategory; average: number } | null;
  bestPerformingTable: { tableName: string; average: number; count: number } | null;
  worstPerformingTable: { tableName: string; average: number; count: number } | null;
  mostActiveCustomer: { id: string; name: string; visits: number } | null;
}

// --- Events ---
export interface EventWithStats extends Event {
  rsvpCount: number;
  attendedCount: number;
  conversionRate: number;
}

export interface EventAnalytics {
  topEvent: { title: string; rsvpCount: number } | null;
  totalRsvps: number;
  totalEvents: number;
  upcomingCount: number;
  growth: { month: string; rsvps: number }[];
}

export const RECOVERY_STATUS_OPTIONS: RecoveryStatus[] = [
  "pending",
  "contacted",
  "resolved",
];

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  "Food",
  "Service",
  "Ambience",
  "Staff",
  "Other",
];

export const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;
