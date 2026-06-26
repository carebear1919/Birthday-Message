export interface BirthdayPage {
  id: string;
  slug: string;
  celebrant_name: string;
  created_at: string;
}

export interface Message {
  id: string;
  page_id: string;
  sender_name: string;
  message_text: string;
  photo_url: string | null;
  rotation_deg: number;
  layout_template: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreatePageResponse {
  birthdayPage: BirthdayPage;
  friendLink: string;
  celebrantLink: string;
}
