import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">여행 플래너</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          기본 SMTP는 시간당 2통이라 매직링크가 막힐 수 있어. 지금은 비밀번호로
          들어가고, 링크는 한도가 풀리면 쓰면 돼.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
