import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">여행 플래너</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          이메일로 로그인 링크를 받을게. 비밀번호는 없어.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
