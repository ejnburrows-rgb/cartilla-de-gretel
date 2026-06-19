export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      assignments: {
        Row: {
          class_id: string;
          created_at: string;
          due_at: string | null;
          id: string;
          lesson_id: string;
          time_limit_seconds: number | null;
          title: string | null;
        };
        Insert: {
          class_id: string;
          created_at?: string;
          due_at?: string | null;
          id?: string;
          lesson_id: string;
          time_limit_seconds?: number | null;
          title?: string | null;
        };
        Update: {
          class_id?: string;
          created_at?: string;
          due_at?: string | null;
          id?: string;
          lesson_id?: string;
          time_limit_seconds?: number | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
        ];
      };
      classes: {
        Row: {
          created_at: string;
          id: string;
          join_code: string;
          name: string;
          teacher_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          join_code: string;
          name: string;
          teacher_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          join_code?: string;
          name?: string;
          teacher_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      progress_events: {
        Row: {
          created_at: string;
          event_kind: string;
          id: string;
          lesson_id: string;
          meta: Json | null;
          score: number | null;
          student_id: string;
          time_seconds: number | null;
          total: number | null;
        };
        Insert: {
          created_at?: string;
          event_kind: string;
          id?: string;
          lesson_id: string;
          meta?: Json | null;
          score?: number | null;
          student_id: string;
          time_seconds?: number | null;
          total?: number | null;
        };
        Update: {
          created_at?: string;
          event_kind?: string;
          id?: string;
          lesson_id?: string;
          meta?: Json | null;
          score?: number | null;
          student_id?: string;
          time_seconds?: number | null;
          total?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "progress_events_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          class_id: string;
          created_at: string;
          display_name: string;
          id: string;
          student_code: string;
        };
        Insert: {
          class_id: string;
          created_at?: string;
          display_name: string;
          id?: string;
          student_code: string;
        };
        Update: {
          class_id?: string;
          created_at?: string;
          display_name?: string;
          id?: string;
          student_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
        ];
      };
      student_lesson_progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          status: "not_started" | "started" | "completed";
          started_at: string;
          completed_at: string | null;
          last_active_at: string;
          best_score: number | null;
          best_total: number | null;
          total_attempts: number;
          time_seconds: number;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id: string;
          status?: "not_started" | "started" | "completed";
          started_at?: string;
          completed_at?: string | null;
          last_active_at?: string;
          best_score?: number | null;
          best_total?: number | null;
          total_attempts?: number;
          time_seconds?: number;
        };
        Update: {
          id?: string;
          student_id?: string;
          lesson_id?: string;
          status?: "not_started" | "started" | "completed";
          started_at?: string;
          completed_at?: string | null;
          last_active_at?: string;
          best_score?: number | null;
          best_total?: number | null;
          total_attempts?: number;
          time_seconds?: number;
        };
        Relationships: [
          {
            foreignKeyName: "student_lesson_progress_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      student_notes: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          teacher_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_notes_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      assignment_progress: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          status: "assigned" | "started" | "completed" | "late";
          started_at: string | null;
          completed_at: string | null;
          time_seconds: number;
          score: number | null;
          total: number | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          status?: "assigned" | "started" | "completed" | "late";
          started_at?: string | null;
          completed_at?: string | null;
          time_seconds?: number;
          score?: number | null;
          total?: number | null;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          status?: "assigned" | "started" | "completed" | "late";
          started_at?: string | null;
          completed_at?: string | null;
          time_seconds?: number;
          score?: number | null;
          total?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "assignment_progress_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignment_progress_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_attempt_summary: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          exercise: string;
          attempts: number;
          hits: number;
          completed_rounds: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id: string;
          exercise: string;
          attempts?: number;
          hits?: number;
          completed_rounds?: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          lesson_id?: string;
          exercise?: string;
          attempts?: number;
          hits?: number;
          completed_rounds?: number;
          last_updated?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_attempt_summary_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_student_assignments: {
        Args: {
          p_class_id: string;
          p_student_id: string;
          p_student_code: string;
        };
        Returns: {
          id: string;
          class_id: string;
          lesson_id: string;
          title: string | null;
          due_at: string | null;
          time_limit_seconds: number | null;
          created_at: string;
        }[];
      };
      get_student_progress: {
        Args: {
          p_student_id: string;
          p_student_code: string;
        };
        Returns: Json;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      join_class: {
        Args: {
          p_join_code: string;
          p_student_code: string;
        };
        Returns: {
          student_id: string;
          student_name: string;
          student_code: string;
          class_id: string;
          class_name: string;
        }[];
      };
      log_student_progress: {
        Args: {
          p_student_id: string;
          p_student_code: string;
          p_lesson_id: string;
          p_event_kind: string;
          p_score: number | null;
          p_total: number | null;
          p_time_seconds: number | null;
          p_meta: Json | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      app_role: "teacher" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["teacher", "admin"],
    },
  },
} as const;
