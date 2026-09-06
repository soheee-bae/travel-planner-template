"use client";

import { BottomNav } from "@/components/layout/BottomNav";

export function AppBottomNav() {
  return (
    <BottomNav
      items={[
        { href: "/trips", label: "여행", icon: <span aria-hidden="true">✈️</span> },
        { href: "/me", label: "마이", icon: <span aria-hidden="true">👤</span> },
      ]}
    />
  );
}
