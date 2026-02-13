import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
  writable: true,
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      getAll: vi.fn(() => []),
      set: vi.fn(),
    })
  ),
}));

// Mock Supabase browser client - singleton so hooks and tests share the same instance
const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    getClaims: vi.fn(),
  },
};
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
      },
    })
  ),
}));
