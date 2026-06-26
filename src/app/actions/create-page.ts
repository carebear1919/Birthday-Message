'use server';

import { getSupabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function createBirthdayPage(
  slug: string,
  celebrantName: string,
  password: string
) {
  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from("birthday_pages")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    throw new Error("This link name is already taken. Please choose another.");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: newPage, error } = await admin
    .from("birthday_pages")
    .insert({
      slug,
      celebrant_name: celebrantName.trim(),
      password_hash,
    })
    .select("id, slug, celebrant_name, created_at")
    .single();

  if (error) throw new Error(error.message);
  if (!newPage) throw new Error("Failed to create birthday page");

  return { birthdayPage: newPage };
}

export async function getCelebrantName(slug: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("birthday_pages")
    .select("celebrant_name")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data.celebrant_name;
}

export async function revealMessages(slug: string, password: string) {
  const admin = getSupabaseAdmin();

  const { data: page, error: pageError } = await admin
    .from("birthday_pages")
    .select("id, password_hash, celebrant_name")
    .eq("slug", slug)
    .maybeSingle();

  if (pageError || !page) {
    throw new Error("Birthday page not found.");
  }

  const isValid = await bcrypt.compare(password, page.password_hash);
  if (!isValid) {
    throw new Error("Incorrect password. Please try again.");
  }

  const { data: msgs, error: msgError } = await admin
    .from("messages")
    .select("*")
    .eq("page_id", page.id)
    .order("created_at", { ascending: true });

  if (msgError) throw new Error(msgError.message);

  return {
    celebrant_name: page.celebrant_name,
    messages: msgs || [],
  };
}
