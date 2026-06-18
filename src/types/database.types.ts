export type FeedbackCategory =
  | "Food"
  | "Service"
  | "Ambience"
  | "Staff"
  | "Other";

export type FeedbackStatus = "pending" | "resolved";

// Phase 2 enums
export type RecoveryStatus = "pending" | "contacted" | "resolved";
export type LoyaltyTransactionType = "earned" | "redeemed" | "adjusted";
export type EventStatus = "draft" | "published" | "completed";

// Billing enums
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired";
export type PaymentProvider = "stripe" | "razorpay" | "paypal";

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  google_review_url: string | null;
  cuisine_type: string | null;
  onboarded: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  restaurant_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  category: FeedbackCategory;
  status: FeedbackStatus;
  table_name: string | null;
  source: string | null;
  review_clicked: boolean;
  recovery_status: RecoveryStatus;
  recovery_notes: string | null;
  created_at: string;
}

export interface TableQr {
  id: string;
  restaurant_id: string;
  table_name: string;
  qr_url: string;
  created_at: string;
}

export interface CustomerVisit {
  id: string;
  restaurant_id: string;
  customer_id: string;
  visit_date: string;
  table_name: string | null;
  source: string | null;
  created_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  restaurant_id: string;
  customer_id: string;
  points: number;
  transaction_type: LoyaltyTransactionType;
  notes: string | null;
  created_at: string;
}

export interface LoyaltyRule {
  id: string;
  restaurant_id: string;
  reward_name: string;
  points_required: number;
  reward_description: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  restaurant_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  event_date: string | null;
  cover_image: string | null;
  status: EventStatus;
  created_at: string;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  name: string;
  phone: string;
  email: string | null;
  attended: boolean;
  created_at: string;
}

// Billing types
export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly_inr: number;
  price_monthly_usd: number;
  stripe_price_id: string | null;
  razorpay_plan_id: string | null;
  paypal_plan_id: string | null;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  restaurant_id: string;
  plan_id: string | null;
  status: SubscriptionStatus;
  provider: PaymentProvider | null;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  subscription_id: string;
  provider: PaymentProvider;
  provider_payment_id: string | null;
  provider_invoice_id: string | null;
  amount: number;
  currency: string;
  status: string;
  invoice_url: string | null;
  receipt_url: string | null;
  failure_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant;
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug?: string | null;
          logo?: string | null;
          google_review_url?: string | null;
          cuisine_type?: string | null;
          onboarded?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string | null;
          logo?: string | null;
          google_review_url?: string | null;
          cuisine_type?: string | null;
          onboarded?: boolean;
        };
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          phone: string;
          email?: string | null;
          birthday?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          email?: string | null;
          birthday?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "customers_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback: {
        Row: Feedback;
        Insert: {
          id?: string;
          restaurant_id: string;
          customer_id: string;
          rating: number;
          comment?: string | null;
          category?: FeedbackCategory;
          status?: FeedbackStatus;
          table_name?: string | null;
          source?: string | null;
          review_clicked?: boolean;
          recovery_status?: RecoveryStatus;
          recovery_notes?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
          category?: FeedbackCategory;
          status?: FeedbackStatus;
          table_name?: string | null;
          source?: string | null;
          review_clicked?: boolean;
          recovery_status?: RecoveryStatus;
          recovery_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      table_qrs: {
        Row: TableQr;
        Insert: {
          id?: string;
          restaurant_id: string;
          table_name: string;
          qr_url: string;
          created_at?: string;
        };
        Update: {
          table_name?: string;
          qr_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "table_qrs_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_visits: {
        Row: CustomerVisit;
        Insert: {
          id?: string;
          restaurant_id: string;
          customer_id: string;
          visit_date?: string;
          table_name?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          visit_date?: string;
          table_name?: string | null;
          source?: string | null;
        };
        Relationships: [];
      };
      loyalty_transactions: {
        Row: LoyaltyTransaction;
        Insert: {
          id?: string;
          restaurant_id: string;
          customer_id: string;
          points: number;
          transaction_type: LoyaltyTransactionType;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          points?: number;
          transaction_type?: LoyaltyTransactionType;
          notes?: string | null;
        };
        Relationships: [];
      };
      loyalty_rules: {
        Row: LoyaltyRule;
        Insert: {
          id?: string;
          restaurant_id: string;
          reward_name: string;
          points_required: number;
          reward_description?: string | null;
          created_at?: string;
        };
        Update: {
          reward_name?: string;
          points_required?: number;
          reward_description?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: {
          id?: string;
          restaurant_id: string;
          title: string;
          slug?: string | null;
          description?: string | null;
          event_date?: string | null;
          cover_image?: string | null;
          status?: EventStatus;
          created_at?: string;
        };
        Update: {
          title?: string;
          slug?: string | null;
          description?: string | null;
          event_date?: string | null;
          cover_image?: string | null;
          status?: EventStatus;
        };
        Relationships: [];
      };
      event_rsvps: {
        Row: EventRsvp;
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          phone: string;
          email?: string | null;
          attended?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          email?: string | null;
          attended?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: Plan;
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price_monthly_inr?: number;
          price_monthly_usd?: number;
          stripe_price_id?: string | null;
          razorpay_plan_id?: string | null;
          paypal_plan_id?: string | null;
          features?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          price_monthly_inr?: number;
          price_monthly_usd?: number;
          stripe_price_id?: string | null;
          razorpay_plan_id?: string | null;
          paypal_plan_id?: string | null;
          features?: string[];
          is_active?: boolean;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: {
          id?: string;
          restaurant_id: string;
          plan_id?: string | null;
          status?: SubscriptionStatus;
          provider?: PaymentProvider | null;
          provider_subscription_id?: string | null;
          provider_customer_id?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan_id?: string | null;
          status?: SubscriptionStatus;
          provider?: PaymentProvider | null;
          provider_subscription_id?: string | null;
          provider_customer_id?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: true;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: Payment;
        Insert: {
          id?: string;
          subscription_id: string;
          provider: PaymentProvider;
          provider_payment_id?: string | null;
          provider_invoice_id?: string | null;
          amount: number;
          currency?: string;
          status: string;
          invoice_url?: string | null;
          receipt_url?: string | null;
          failure_reason?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          status?: string;
          invoice_url?: string | null;
          receipt_url?: string | null;
          failure_reason?: string | null;
          metadata?: Record<string, unknown>;
        };
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      feedback_category: FeedbackCategory;
      feedback_status: FeedbackStatus;
      recovery_status: RecoveryStatus;
      loyalty_transaction_type: LoyaltyTransactionType;
      event_status: EventStatus;
      subscription_status: SubscriptionStatus;
      payment_provider: PaymentProvider;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Utility types for billing
export interface SubscriptionWithPlan extends Subscription {
  plan: Plan | null;
}

export interface PaymentWithSubscription extends Payment {
  subscription: Subscription;
}
