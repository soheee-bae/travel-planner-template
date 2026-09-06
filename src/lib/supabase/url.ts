/** 대시보드에서 /rest/v1/까지 복사해도 클라이언트는 프로젝트 루트 URL만 받는다. */
export function normalizeSupabaseUrl(raw: string): string {
  return raw
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/i, "");
}

export function getSupabaseUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw?.trim()) return undefined;
  return normalizeSupabaseUrl(raw);
}

export function getSupabaseAnonKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key?.trim()) return undefined;
  return key.trim();
}
