import { describe, it, expect, vi, beforeEach } from "vitest";
import { login, signup, signInWithOAuth, logout } from "../actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Get a handle to the mocked redirect
const { redirect } = await vi.importMock<typeof import("next/navigation")>(
  "next/navigation"
);

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    fd.set(k, v);
  }
  return fd;
}

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects on successful login", async () => {
    const mockAuth = {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: mockAuth,
    } as never);

    await expect(
      login(makeFormData({ email: "test@example.com", password: "password123" }))
    ).rejects.toThrow("NEXT_REDIRECT:/");

    expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("returns error on invalid credentials", async () => {
    const mockAuth = {
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ error: { message: "Invalid" } }),
    };
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: mockAuth,
    } as never);

    const result = await login(
      makeFormData({ email: "test@example.com", password: "wrong" })
    );

    expect(result).toEqual({ error: "Invalid email or password." });
  });
});

describe("signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error if email is missing", async () => {
    const result = await signup(makeFormData({ email: "", password: "password123" }));
    expect(result).toEqual({
      error: "Email and password (min 6 characters) are required.",
    });
  });

  it("returns error if password too short", async () => {
    const result = await signup(
      makeFormData({ email: "test@example.com", password: "12345" })
    );
    expect(result).toEqual({
      error: "Email and password (min 6 characters) are required.",
    });
  });

  it("returns success message on valid signup", async () => {
    const mockAuth = {
      signUp: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: mockAuth,
    } as never);

    const result = await signup(
      makeFormData({ email: "test@example.com", password: "password123" })
    );

    expect(result).toEqual({
      success: "Check your email to confirm your account.",
    });
    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("returns error on signup failure", async () => {
    const mockAuth = {
      signUp: vi.fn().mockResolvedValue({ error: { message: "Exists" } }),
    };
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: mockAuth,
    } as never);

    const result = await signup(
      makeFormData({ email: "test@example.com", password: "password123" })
    );

    expect(result).toEqual({
      error: "Unable to create account. Please try again.",
    });
  });
});

describe("signInWithOAuth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns error in production without SITE_URL", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_SITE_URL;

    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { signInWithOAuth: vi.fn() },
    } as never);

    const result = await signInWithOAuth("github");
    expect(result).toEqual({ error: "Server configuration error." });
  });

  it("redirects on successful OAuth", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const mockAuth = {
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { url: "https://github.com/oauth" },
        error: null,
      }),
    };
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: mockAuth,
    } as never);

    await expect(signInWithOAuth("github")).rejects.toThrow(
      "NEXT_REDIRECT:https://github.com/oauth"
    );

    expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "github",
      options: { redirectTo: "https://example.com/auth/callback" },
    });
  });

  it("returns error on OAuth failure", async () => {
    const mockAuth = {
      signInWithOAuth: vi
        .fn()
        .mockResolvedValue({ data: {}, error: { message: "Fail" } }),
    };
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: mockAuth,
    } as never);

    const result = await signInWithOAuth("google");
    expect(result).toEqual({
      error: "Unable to sign in with this provider.",
    });
  });

  it("uses localhost fallback in development", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const mockAuth = {
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { url: "https://github.com/oauth" },
        error: null,
      }),
    };
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: mockAuth,
    } as never);

    await expect(signInWithOAuth("github")).rejects.toThrow("NEXT_REDIRECT:");

    expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "github",
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });
  });
});

describe("logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signs out and redirects to /login", async () => {
    const mockAuth = {
      signOut: vi.fn().mockResolvedValue({}),
    };
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: mockAuth,
    } as never);

    await expect(logout()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mockAuth.signOut).toHaveBeenCalled();
  });
});
