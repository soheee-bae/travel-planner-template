import { describe, expect, it } from "vitest";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

describe("normalizeSupabaseUrl", () => {
  it("프로젝트 루트 URL은 그대로 둔다", () => {
    expect(normalizeSupabaseUrl("https://abc.supabase.co")).toBe("https://abc.supabase.co");
  });

  it("/rest/v1/ 를 제거한다", () => {
    expect(normalizeSupabaseUrl("https://abc.supabase.co/rest/v1/")).toBe(
      "https://abc.supabase.co",
    );
  });
});
