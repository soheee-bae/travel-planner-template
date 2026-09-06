"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { isMockData } from "@/lib/data-source";
import { createClient } from "@/lib/supabase/client";

export function AccountBar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (isMockData()) return;
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  if (isMockData()) return null;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
      <span className="truncate">{email ?? "로그인됨"}</span>
      <Button type="button" size="sm" variant="ghost" onClick={signOut}>
        로그아웃
      </Button>
    </div>
  );
}
