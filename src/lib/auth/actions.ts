"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || password.length < 6) {
    return { error: "Email and password (min 6 characters) are required." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: "Unable to create account. Please try again." };
  }

  return { success: "Check your email to confirm your account." };
}

export async function signInWithOAuth(provider: "github" | "google") {
  const supabase = await createServerSupabaseClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl && process.env.NODE_ENV === "production") {
    return { error: "Server configuration error." };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: "Unable to sign in with this provider." };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
