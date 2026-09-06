export function TangerineMascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      role="img"
      aria-label="귤 캐릭터"
    >
      <ellipse cx="80" cy="148" rx="42" ry="8" fill="#E8D9C4" />
      <circle cx="80" cy="88" r="52" fill="#FFB26B" stroke="#3D2B1F" strokeWidth="5" />
      <ellipse cx="80" cy="58" rx="18" ry="10" fill="#7BC67E" stroke="#3D2B1F" strokeWidth="4" />
      <path d="M80 50 v-16" stroke="#3D2B1F" strokeWidth="4" strokeLinecap="round" />
      <circle cx="62" cy="86" r="5" fill="#3D2B1F" />
      <circle cx="98" cy="86" r="5" fill="#3D2B1F" />
      <circle cx="64" cy="84" r="1.6" fill="#FFF6E8" />
      <circle cx="100" cy="84" r="1.6" fill="#FFF6E8" />
      <path
        d="M68 108c8 10 16 10 24 0"
        fill="none"
        stroke="#3D2B1F"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="48" cy="102" r="8" fill="#FF8FA3" opacity="0.85" />
      <circle cx="112" cy="102" r="8" fill="#FF8FA3" opacity="0.85" />
    </svg>
  );
}
