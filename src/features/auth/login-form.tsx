"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [email, setEmail] = useState("amybae28@gmail.com");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus("working");
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      const next = nextPath && nextPath.startsWith("/") ? nextPath : "/trips";
      window.location.assign(next);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "로그인에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  async function sendMagicLink() {
    setStatus("working");
    setMessage(null);
    try {
      const supabase = createClient();
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) throw error;
      setStatus("sent");
      setMessage(`${email}로 로그인 링크를 보냈어. 메일함(스팸 포함)을 확인해.`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "메일을 보내지 못했어.");
    }
  }

  return (
    <form onSubmit={signInWithPassword} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email">이메일</Label>
        <Input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-password">비밀번호</Label>
        <Input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="h-11" disabled={status === "working"}>
        {status === "working" ? "로그인 중…" : "비밀번호로 로그인"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-11"
        disabled={status === "working"}
        onClick={sendMagicLink}
      >
        매직 링크 보내기
      </Button>
      {message && (
        <p
          role="status"
          className={
            status === "error"
              ? "text-[12px] leading-[18px] font-semibold text-[#E85D4C]"
              : "text-sm text-muted-foreground"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
