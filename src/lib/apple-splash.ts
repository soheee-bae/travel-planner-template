/** iOS 홈 화면 앱 실행 시 인앱 스플래시와 같은 섬+문구 이미지. CSS 픽셀 × DPR = PNG 크기. */
export const APPLE_SPLASH_IMAGES = [
  { cssW: 440, cssH: 956, dpr: 3, w: 1320, h: 2868 },
  { cssW: 430, cssH: 932, dpr: 3, w: 1290, h: 2796 },
  { cssW: 428, cssH: 926, dpr: 3, w: 1284, h: 2778 },
  { cssW: 414, cssH: 896, dpr: 3, w: 1242, h: 2688 },
  { cssW: 402, cssH: 874, dpr: 3, w: 1206, h: 2622 },
  { cssW: 393, cssH: 852, dpr: 3, w: 1179, h: 2556 },
  { cssW: 390, cssH: 844, dpr: 3, w: 1170, h: 2532 },
  { cssW: 375, cssH: 812, dpr: 3, w: 1125, h: 2436 },
  { cssW: 414, cssH: 736, dpr: 3, w: 1242, h: 2208 },
  { cssW: 414, cssH: 896, dpr: 2, w: 828, h: 1792 },
  { cssW: 375, cssH: 667, dpr: 2, w: 750, h: 1334 },
] as const;

export function appleSplashStartupImages() {
  return [
    { url: "/splash/apple-splash.png" },
    ...APPLE_SPLASH_IMAGES.map((size) => ({
      url: `/splash/apple-splash-${size.w}x${size.h}.png`,
      media: `(device-width: ${size.cssW}px) and (device-height: ${size.cssH}px) and (-webkit-device-pixel-ratio: ${size.dpr}) and (orientation: portrait)`,
    })),
  ];
}
