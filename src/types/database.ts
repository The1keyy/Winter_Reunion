export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "co-admin" | "member";

export type TripStageStatus =
  | "Not Started"
  | "Planning"
  | "Voting Open"
  | "Waiting"
  | "Finalized"
  | "Booked"
  | "Completed";

export type SuggestionStatus = "open" | "accepted" | "rejected";
export type PollStatus = "open" | "closed";
export type CabinStatus = "proposed" | "voting" | "selected" | "rejected";
export type ActivityStatus = "proposed" | "confirmed" | "cancelled";
export type ActivityResponseValue = "yes" | "no" | "maybe" | "pending";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trip_settings: {
        Row: {
          id: number;
          trip_name: string;
          start_date: string | null;
          end_date: string | null;
          state: string | null;
          city_or_area: string | null;
          guest_limit: number | null;
          estimated_budget_low: number | null;
          estimated_budget_high: number | null;
          skiing_status: TripStageStatus;
          cabin_search_status: TripStageStatus;
          transportation_status: TripStageStatus;
          payment_status: TripStageStatus;
          registration_status: TripStageStatus;
          selected_cabin_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          trip_name?: string;
          start_date?: string | null;
          end_date?: string | null;
          state?: string | null;
          city_or_area?: string | null;
          guest_limit?: number | null;
          estimated_budget_low?: number | null;
          estimated_budget_high?: number | null;
          skiing_status?: TripStageStatus;
          cabin_search_status?: TripStageStatus;
          transportation_status?: TripStageStatus;
          payment_status?: TripStageStatus;
          registration_status?: TripStageStatus;
          selected_cabin_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          trip_name?: string;
          start_date?: string | null;
          end_date?: string | null;
          state?: string | null;
          city_or_area?: string | null;
          guest_limit?: number | null;
          estimated_budget_low?: number | null;
          estimated_budget_high?: number | null;
          skiing_status?: TripStageStatus;
          cabin_search_status?: TripStageStatus;
          transportation_status?: TripStageStatus;
          payment_status?: TripStageStatus;
          registration_status?: TripStageStatus;
          selected_cabin_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      registrations: {
        Row: {
          id: string;
          profile_id: string;
          attending: boolean;
          guests_count: number;
          dietary_restrictions: string | null;
          notes: string | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          attending?: boolean;
          guests_count?: number;
          dietary_restrictions?: string | null;
          notes?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          attending?: boolean;
          guests_count?: number;
          dietary_restrictions?: string | null;
          notes?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          author_id: string | null;
          title: string;
          body: string;
          link_url: string | null;
          pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          title: string;
          body: string;
          link_url?: string | null;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          title?: string;
          body?: string;
          link_url?: string | null;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      suggestions: {
        Row: {
          id: string;
          created_by: string | null;
          category: string;
          title: string;
          description: string | null;
          status: SuggestionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          category: string;
          title: string;
          description?: string | null;
          status?: SuggestionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string | null;
          category?: string;
          title?: string;
          description?: string | null;
          status?: SuggestionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      suggestion_votes: {
        Row: {
          id: string;
          suggestion_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          suggestion_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          suggestion_id?: string;
          profile_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      polls: {
        Row: {
          id: string;
          created_by: string | null;
          question: string;
          description: string | null;
          is_multiple_choice: boolean;
          status: PollStatus;
          closes_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          question: string;
          description?: string | null;
          is_multiple_choice?: boolean;
          status?: PollStatus;
          closes_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string | null;
          question?: string;
          description?: string | null;
          is_multiple_choice?: boolean;
          status?: PollStatus;
          closes_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          option_text: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_text: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_text?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          profile_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      cabins: {
        Row: {
          id: string;
          created_by: string | null;
          name: string;
          url: string | null;
          location: string | null;
          price_total: number | null;
          price_per_person: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          max_occupancy: number | null;
          notes: string | null;
          status: CabinStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          name: string;
          url?: string | null;
          location?: string | null;
          price_total?: number | null;
          price_per_person?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          max_occupancy?: number | null;
          notes?: string | null;
          status?: CabinStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string | null;
          name?: string;
          url?: string | null;
          location?: string | null;
          price_total?: number | null;
          price_per_person?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          max_occupancy?: number | null;
          notes?: string | null;
          status?: CabinStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cabin_votes: {
        Row: {
          id: string;
          cabin_id: string;
          profile_id: string;
          rank: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cabin_id: string;
          profile_id: string;
          rank?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cabin_id?: string;
          profile_id?: string;
          rank?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          created_by: string | null;
          name: string;
          description: string | null;
          category: string | null;
          activity_date: string | null;
          start_time: string | null;
          end_time: string | null;
          location: string | null;
          cost_per_person: number | null;
          status: ActivityStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          name: string;
          description?: string | null;
          category?: string | null;
          activity_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          location?: string | null;
          cost_per_person?: number | null;
          status?: ActivityStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string | null;
          name?: string;
          description?: string | null;
          category?: string | null;
          activity_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          location?: string | null;
          cost_per_person?: number | null;
          status?: ActivityStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_responses: {
        Row: {
          id: string;
          activity_id: string;
          profile_id: string;
          response: ActivityResponseValue;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          profile_id: string;
          response?: ActivityResponseValue;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          activity_id?: string;
          profile_id?: string;
          response?: ActivityResponseValue;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          profile_id: string;
          description: string;
          category: string | null;
          amount: number;
          status: PaymentStatus;
          due_date: string | null;
          paid_at: string | null;
          payment_method: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          description: string;
          category?: string | null;
          amount: number;
          status?: PaymentStatus;
          due_date?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          description?: string;
          category?: string | null;
          amount?: number;
          status?: PaymentStatus;
          due_date?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      itinerary_items: {
        Row: {
          id: string;
          created_by: string | null;
          item_date: string;
          start_time: string | null;
          end_time: string | null;
          title: string;
          description: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          item_date: string;
          start_time?: string | null;
          end_time?: string | null;
          title: string;
          description?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string | null;
          item_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          title?: string;
          description?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          driver_id: string | null;
          name: string | null;
          capacity: number;
          departure_location: string | null;
          departure_time: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id?: string | null;
          name?: string | null;
          capacity?: number;
          departure_location?: string | null;
          departure_time?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string | null;
          name?: string | null;
          capacity?: number;
          departure_location?: string | null;
          departure_time?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vehicle_passengers: {
        Row: {
          id: string;
          vehicle_id: string;
          profile_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          profile_id: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          profile_id?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      talk_posts: {
        Row: {
          id: string;
          author_id: string | null;
          title: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          title: string;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          title?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      talk_replies: {
        Row: {
          id: string;
          post_id: string;
          author_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id?: string | null;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string | null;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      trip_stage_status: TripStageStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

export type Profile = Tables<"profiles">;
export type TripSettings = Tables<"trip_settings">;
export type Registration = Tables<"registrations">;
export type Announcement = Tables<"announcements">;
export type Suggestion = Tables<"suggestions">;
export type Poll = Tables<"polls">;
export type PollOption = Tables<"poll_options">;
export type Cabin = Tables<"cabins">;
export type Activity = Tables<"activities">;
export type Payment = Tables<"payments">;
export type TalkPost = Tables<"talk_posts">;
export type TalkReply = Tables<"talk_replies">;
export type ItineraryItem = Tables<"itinerary_items">;
export type Vehicle = Tables<"vehicles">;
