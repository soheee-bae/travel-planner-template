import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Jua, Noto_Sans_KR } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { Providers } from "@/app/providers";
import "./globals.css";

// 본문·UI 전용. 카드 제목·버튼·탭 라벨·본문은 항상 이 폰트를 쓴다 (DESIGN.md §타이포그래피).
const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jua = Jua({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "소희 & 준형의 제주",
  description: "남자친구 생일 기념 제주 여행 플래너",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={cn("antialiased", notoSansKR.variable, jua.variable)}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
