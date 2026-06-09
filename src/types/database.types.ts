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

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
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

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant;
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          logo?: string | null;
          google_review_url?: string | null;
          cuisine_type?: string | null;
          onboarded?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
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
          description?: string | null;
          event_date?: string | null;
          cover_image?: string | null;
          status?: EventStatus;
          created_at?: string;
        };
        Update: {
          title?: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      feedback_category: FeedbackCategory;
      feedback_status: FeedbackStatus;
      recovery_status: RecoveryStatus;
      loyalty_transaction_type: LoyaltyTransactionType;
      event_status: EventStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
