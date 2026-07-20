/**
 * Shared chainable Supabase query-builder mock for *.functions.ts tests.
 *
 * The real supabase-js query builder is thenable (awaiting it directly
 * resolves {data, error}) AND every filter/modifier method (.eq/.in/.order/
 * .is/.select/.insert/.delete/.upsert) returns the same chainable builder, so
 * `await supabase.from(x).select(y).eq(z).eq(w)` and
 * `await supabase.from(x).select(y).eq(z).maybeSingle()` both need to work
 * off one mock shape. This factory builds that shape once so
 * teacher/assignments/folder-assignments/lesson-verification tests don't
 * each reinvent it.
 */
import { vi } from "vitest";

export interface QueryResult<T = unknown> {
  data: T;
  error: { message: string; code?: string } | null;
}

export function makeQueryBuilder<T>(result: QueryResult<T>) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  for (const method of [
    "select",
    "eq",
    "in",
    "order",
    "is",
    "insert",
    "upsert",
    "update",
    "delete",
    "limit",
  ]) {
    builder[method] = vi.fn(chain);
  }
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.then = (resolve: (r: QueryResult<T>) => unknown) => resolve(result);
  return builder;
}

export function ok<T>(data: T): QueryResult<T> {
  return { data, error: null };
}

export function fail(message: string, code?: string): QueryResult<null> {
  return { data: null, error: { message, code } };
}

/** A signed-in teacher's `supabase.auth.getUser()` result. */
export function authedUser(id = "99999999-9999-9999-9999-999999999999") {
  return { data: { user: { id } }, error: null };
}

export const signedOut = { data: { user: null }, error: null };
