import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Jua, Noto_Sans_KR, Nunito } from "next/font/google";
import { cn } from "@/lib/utils";
import { appleSplashStartupImages } from "@/lib/apple-splash";
import { AppShell } from "@/components/layout/AppShell";
import { Providers } from "@/app/providers";
import "./globals.css";

// 본문·UI 전용. 카드 제목·버튼·탭 라벨·본문은 항상 이 폰트를 쓴다 (DESIGN.md §타이포그래피).
const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const jua = Jua({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "소희 & 준형 in JEJU",
  description: "남자친구 생일 기념 제주 여행 플래너",
  applicationName: "소희 & 준형 in JEJU",
  appleWebApp: {
    capable: true,
    title: "소희 & 준형",
    statusBarStyle: "default",
    startupImage: appleSplashStartupImages(),
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={cn("antialiased", notoSansKR.variable, nunito.variable, jua.variable)}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
