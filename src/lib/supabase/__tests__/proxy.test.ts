import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "../proxy";

// Mock @supabase/ssr
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

function createMockRequest(pathname: string) {
  const url = `http://localhost:3000${pathname}`;
  return new NextRequest(new URL(url));
}

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("redirects unauthenticated users to /login", async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: null } }),
      },
    } as never);

    const request = createMockRequest("/");
    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
  });

  it("allows unauthenticated users on /login", async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: null } }),
      },
    } as never);

    const request = createMockRequest("/login");
    const response = await updateSession(request);

    expect(response.status).toBe(200);
  });

  it("allows unauthenticated users on /signup", async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: null } }),
      },
    } as never);

    const request = createMockRequest("/signup");
    const response = await updateSession(request);

    expect(response.status).toBe(200);
  });

  it("allows unauthenticated users on /auth/* paths", async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: null } }),
      },
    } as never);

    const request = createMockRequest("/auth/callback");
    const response = await updateSession(request);

    expect(response.status).toBe(200);
  });

  it("redirects authenticated users from /login to /", async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi
          .fn()
          .mockResolvedValue({ data: { claims: { sub: "u1" } } }),
      },
    } as never);

    const request = createMockRequest("/login");
    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/");
  });

  it("redirects authenticated users from /signup to /", async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi
          .fn()
          .mockResolvedValue({ data: { claims: { sub: "u1" } } }),
      },
    } as never);

    const request = createMockRequest("/signup");
    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/");
  });

  it("allows authenticated users on protected pages", async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi
          .fn()
          .mockResolvedValue({ data: { claims: { sub: "u1" } } }),
      },
    } as never);

    const request = createMockRequest("/");
    const response = await updateSession(request);

    expect(response.status).toBe(200);
  });
});
