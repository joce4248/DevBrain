export type Database = {
  public: {
    Tables: {
      snippets: {
        Row: {
          id: string;
          title: string;
          content: string;
          description: string | null;
          language: string;
          is_favorite: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          description?: string | null;
          language: string;
          is_favorite?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          description?: string | null;
          language?: string;
          is_favorite?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      snippet_tags: {
        Row: {
          snippet_id: string;
          tag_id: string;
        };
        Insert: {
          snippet_id: string;
          tag_id: string;
        };
        Update: {
          snippet_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "snippet_tags_snippet_id_fkey";
            columns: ["snippet_id"];
            isOneToOne: false;
            referencedRelation: "snippets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "snippet_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
