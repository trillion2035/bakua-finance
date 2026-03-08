export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      harvest_data: {
        Row: {
          cherry_intake: number | null
          conversion_rate: number | null
          created_at: string
          grade_a_percent: number | null
          green_yield: number | null
          id: string
          month: string
          spv_id: string
        }
        Insert: {
          cherry_intake?: number | null
          conversion_rate?: number | null
          created_at?: string
          grade_a_percent?: number | null
          green_yield?: number | null
          id?: string
          month: string
          spv_id: string
        }
        Update: {
          cherry_intake?: number | null
          conversion_rate?: number | null
          created_at?: string
          grade_a_percent?: number | null
          green_yield?: number | null
          id?: string
          month?: string
          spv_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "harvest_data_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount_invested: number
          created_at: string
          currency: string
          current_value: number | null
          id: string
          invested_date: string
          investor_id: string
          next_distribution: string | null
          spv_id: string
          status: Database["public"]["Enums"]["investment_status"]
          tx_hash: string | null
          updated_at: string
        }
        Insert: {
          amount_invested: number
          created_at?: string
          currency?: string
          current_value?: number | null
          id?: string
          invested_date?: string
          investor_id: string
          next_distribution?: string | null
          spv_id: string
          status?: Database["public"]["Enums"]["investment_status"]
          tx_hash?: string | null
          updated_at?: string
        }
        Update: {
          amount_invested?: number
          created_at?: string
          currency?: string
          current_value?: number | null
          id?: string
          invested_date?: string
          investor_id?: string
          next_distribution?: string | null
          spv_id?: string
          status?: Database["public"]["Enums"]["investment_status"]
          tx_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_segments: {
        Row: {
          created_at: string
          fcfa_equivalent: string | null
          id: string
          investor_count: number | null
          name: string
          percent_of_spv: string | null
          spv_id: string
          usdc_raised: string | null
        }
        Insert: {
          created_at?: string
          fcfa_equivalent?: string | null
          id?: string
          investor_count?: number | null
          name: string
          percent_of_spv?: string | null
          spv_id: string
          usdc_raised?: string | null
        }
        Update: {
          created_at?: string
          fcfa_equivalent?: string | null
          id?: string
          investor_count?: number | null
          name?: string
          percent_of_spv?: string | null
          spv_id?: string
          usdc_raised?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_segments_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_financials: {
        Row: {
          collection_rate: number | null
          collections: number | null
          created_at: string
          id: string
          loan_repayment: number | null
          month: string
          net_margin: number | null
          operating_cost: number | null
          revenue: number | null
          spv_id: string
          tx_count: number | null
        }
        Insert: {
          collection_rate?: number | null
          collections?: number | null
          created_at?: string
          id?: string
          loan_repayment?: number | null
          month: string
          net_margin?: number | null
          operating_cost?: number | null
          revenue?: number | null
          spv_id: string
          tx_count?: number | null
        }
        Update: {
          collection_rate?: number | null
          collections?: number | null
          created_at?: string
          id?: string
          loan_repayment?: number | null
          month?: string
          net_margin?: number | null
          operating_cost?: number | null
          revenue?: number | null
          spv_id?: string
          tx_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_financials_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      ndvi_readings: {
        Row: {
          created_at: string
          id: string
          reading_date: string
          source: string | null
          spv_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          reading_date: string
          source?: string | null
          spv_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          reading_date?: string
          source?: string | null
          spv_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "ndvi_readings_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          read: boolean | null
          spv_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          read?: boolean | null
          spv_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          read?: boolean | null
          spv_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      oracle_events: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          description: string | null
          event_timestamp: string
          event_type: Database["public"]["Enums"]["oracle_event_type"]
          id: string
          metadata: Json | null
          payment_channel: Json | null
          source: string | null
          spv_id: string
          status: Database["public"]["Enums"]["oracle_event_status"]
          title: string
          tx_hash: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          event_timestamp?: string
          event_type: Database["public"]["Enums"]["oracle_event_type"]
          id?: string
          metadata?: Json | null
          payment_channel?: Json | null
          source?: string | null
          spv_id: string
          status?: Database["public"]["Enums"]["oracle_event_status"]
          title: string
          tx_hash?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          event_timestamp?: string
          event_type?: Database["public"]["Enums"]["oracle_event_type"]
          id?: string
          metadata?: Json | null
          payment_channel?: Json | null
          source?: string | null
          spv_id?: string
          status?: Database["public"]["Enums"]["oracle_event_status"]
          title?: string
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oracle_events_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          created_at: string
          device_id: string
          device_name: string | null
          id: string
          location: string | null
          metric: string
          reading_timestamp: string
          spv_id: string
          status: Database["public"]["Enums"]["sensor_status"]
          threshold_max: number | null
          threshold_min: number | null
          unit: string | null
          value: number
        }
        Insert: {
          created_at?: string
          device_id: string
          device_name?: string | null
          id?: string
          location?: string | null
          metric: string
          reading_timestamp?: string
          spv_id: string
          status?: Database["public"]["Enums"]["sensor_status"]
          threshold_max?: number | null
          threshold_min?: number | null
          unit?: string | null
          value: number
        }
        Update: {
          created_at?: string
          device_id?: string
          device_name?: string | null
          id?: string
          location?: string | null
          metric?: string
          reading_timestamp?: string
          spv_id?: string
          status?: Database["public"]["Enums"]["sensor_status"]
          threshold_max?: number | null
          threshold_min?: number | null
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      spv_contracts: {
        Row: {
          address: string
          created_at: string
          deployed_date: string | null
          id: string
          name: string
          spv_id: string
        }
        Insert: {
          address: string
          created_at?: string
          deployed_date?: string | null
          id?: string
          name: string
          spv_id: string
        }
        Update: {
          address?: string
          created_at?: string
          deployed_date?: string | null
          id?: string
          name?: string
          spv_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spv_contracts_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      spv_documents: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          name: string
          parties: string | null
          purpose: string | null
          signed_date: string | null
          sort_order: number | null
          spv_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          name: string
          parties?: string | null
          purpose?: string | null
          signed_date?: string | null
          sort_order?: number | null
          spv_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          name?: string
          parties?: string | null
          purpose?: string | null
          signed_date?: string | null
          sort_order?: number | null
          spv_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spv_documents_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      spv_milestones: {
        Row: {
          amount: string | null
          amount_raw: number | null
          created_at: string
          date_disbursed: string | null
          id: string
          milestone_code: string
          name: string
          oracle_trigger: string | null
          recipients: string | null
          sort_order: number | null
          spv_id: string
          status: Database["public"]["Enums"]["milestone_status"]
        }
        Insert: {
          amount?: string | null
          amount_raw?: number | null
          created_at?: string
          date_disbursed?: string | null
          id?: string
          milestone_code: string
          name: string
          oracle_trigger?: string | null
          recipients?: string | null
          sort_order?: number | null
          spv_id: string
          status?: Database["public"]["Enums"]["milestone_status"]
        }
        Update: {
          amount?: string | null
          amount_raw?: number | null
          created_at?: string
          date_disbursed?: string | null
          id?: string
          milestone_code?: string
          name?: string
          oracle_trigger?: string | null
          recipients?: string | null
          sort_order?: number | null
          spv_id?: string
          status?: Database["public"]["Enums"]["milestone_status"]
        }
        Relationships: [
          {
            foreignKeyName: "spv_milestones_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      spv_score_dimensions: {
        Row: {
          created_at: string
          id: string
          name: string
          raw_input: string | null
          score: number
          spv_id: string
          standardized_output: string | null
          weight: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          raw_input?: string | null
          score: number
          spv_id: string
          standardized_output?: string | null
          weight?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          raw_input?: string | null
          score?: number
          spv_id?: string
          standardized_output?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spv_score_dimensions_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      spvs: {
        Row: {
          asset_type: string | null
          auditor: string | null
          capital_social: string | null
          company_type: string | null
          created_at: string
          currency: string | null
          description: string | null
          disbursed_percent: number | null
          dsra_reserve: string | null
          full_legal_name: string | null
          fully_funded_date: string | null
          funded_amount: number | null
          funded_percent: number | null
          id: string
          incorporation_date: string | null
          jurisdiction: string | null
          listing_date: string | null
          name: string
          network: string | null
          owner_id: string
          projected_irr: string | null
          registered_office: string | null
          registration_no: string | null
          remaining_in_vault: number | null
          shareholder: string | null
          spv_code: string
          status: Database["public"]["Enums"]["spv_status"]
          target_amount: number | null
          target_amount_usd: string | null
          target_irr: string | null
          total_disbursed: number | null
          total_investors: number | null
          updated_at: string
        }
        Insert: {
          asset_type?: string | null
          auditor?: string | null
          capital_social?: string | null
          company_type?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          disbursed_percent?: number | null
          dsra_reserve?: string | null
          full_legal_name?: string | null
          fully_funded_date?: string | null
          funded_amount?: number | null
          funded_percent?: number | null
          id?: string
          incorporation_date?: string | null
          jurisdiction?: string | null
          listing_date?: string | null
          name: string
          network?: string | null
          owner_id: string
          projected_irr?: string | null
          registered_office?: string | null
          registration_no?: string | null
          remaining_in_vault?: number | null
          shareholder?: string | null
          spv_code: string
          status?: Database["public"]["Enums"]["spv_status"]
          target_amount?: number | null
          target_amount_usd?: string | null
          target_irr?: string | null
          total_disbursed?: number | null
          total_investors?: number | null
          updated_at?: string
        }
        Update: {
          asset_type?: string | null
          auditor?: string | null
          capital_social?: string | null
          company_type?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          disbursed_percent?: number | null
          dsra_reserve?: string | null
          full_legal_name?: string | null
          fully_funded_date?: string | null
          funded_amount?: number | null
          funded_percent?: number | null
          id?: string
          incorporation_date?: string | null
          jurisdiction?: string | null
          listing_date?: string | null
          name?: string
          network?: string | null
          owner_id?: string
          projected_irr?: string | null
          registered_office?: string | null
          registration_no?: string | null
          remaining_in_vault?: number | null
          shareholder?: string | null
          spv_code?: string
          status?: Database["public"]["Enums"]["spv_status"]
          target_amount?: number | null
          target_amount_usd?: string | null
          target_irr?: string | null
          total_disbursed?: number | null
          total_investors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: string
          created_at: string
          id: string
          investor_id: string
          spv_id: string
          tx_date: string
          tx_hash: string | null
          type: string
        }
        Insert: {
          amount: string
          created_at?: string
          id?: string
          investor_id: string
          spv_id: string
          tx_date?: string
          tx_hash?: string | null
          type: string
        }
        Update: {
          amount?: string
          created_at?: string
          id?: string
          investor_id?: string
          spv_id?: string
          tx_date?: string
          tx_hash?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_spv_id_fkey"
            columns: ["spv_id"]
            isOneToOne: false
            referencedRelation: "spvs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "project_owner" | "investor"
      investment_status: "active" | "distributing" | "matured"
      milestone_status: "pending" | "disbursed"
      oracle_event_status: "confirmed" | "pending" | "failed"
      oracle_event_type:
        | "payment_received"
        | "payment_confirmed"
        | "milestone_verified"
        | "sensor_alert"
        | "threshold_breach"
        | "disbursement_triggered"
        | "compliance_check"
      sensor_status: "normal" | "warning" | "critical"
      spv_status:
        | "draft"
        | "active"
        | "funded"
        | "distributing"
        | "matured"
        | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "project_owner", "investor"],
      investment_status: ["active", "distributing", "matured"],
      milestone_status: ["pending", "disbursed"],
      oracle_event_status: ["confirmed", "pending", "failed"],
      oracle_event_type: [
        "payment_received",
        "payment_confirmed",
        "milestone_verified",
        "sensor_alert",
        "threshold_breach",
        "disbursement_triggered",
        "compliance_check",
      ],
      sensor_status: ["normal", "warning", "critical"],
      spv_status: [
        "draft",
        "active",
        "funded",
        "distributing",
        "matured",
        "closed",
      ],
    },
  },
} as const
