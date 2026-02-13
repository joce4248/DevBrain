import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Prevent open redirect — only allow relative paths
  const redirectPath = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // Redirect to login with error on failure
  return NextResponse.redirect(new URL("/login", request.url));
}
