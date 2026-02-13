import { vi } from "vitest";
import { createClient } from "@/lib/supabase/client";

type SupabaseChainResult = {
  data: unknown;
  error: unknown;
};

/**
 * Creates a chainable mock that simulates Supabase query builder.
 * Usage:
 *   const mockFrom = createSupabaseChain({ data: [...], error: null });
 *   mockSupabase.from.mockReturnValue(mockFrom);
 */
export function createSupabaseChain(result: SupabaseChainResult) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "not",
    "is",
    "in",
    "or",
    "ilike",
    "order",
    "single",
    "maybeSingle",
  ];

  const proxy = new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (prop === "then") {
          return (resolve: (v: SupabaseChainResult) => void) =>
            resolve(result);
        }
        if (methods.includes(prop)) {
          if (!chain[prop]) {
            chain[prop] = vi.fn().mockReturnValue(proxy);
          }
          return chain[prop];
        }
        return undefined;
      },
    }
  );

  return proxy;
}

/**
 * Gets the mocked Supabase client from the mocked module.
 * Must be called after vi.mock("@/lib/supabase/client") is active (in vitest.setup.ts).
 */
export function getMockedSupabase() {
  return vi.mocked(createClient)() as unknown as {
    from: ReturnType<typeof vi.fn>;
    auth: {
      getUser: ReturnType<typeof vi.fn>;
      signInWithPassword: ReturnType<typeof vi.fn>;
      signUp: ReturnType<typeof vi.fn>;
      signInWithOAuth: ReturnType<typeof vi.fn>;
      signOut: ReturnType<typeof vi.fn>;
    };
  };
}
