import { cn } from "@/lib/utils";
import { resolveMemoIcon } from "@/lib/illustrations";

export function IllustrationIcon({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={cn("pointer-events-none select-none object-contain", className)}
    />
  );
}

export function Glyph({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const src = resolveMemoIcon(value);
  if (src.startsWith("/")) {
    return <IllustrationIcon src={src} className={cn("size-5", className)} />;
  }
  return <span className={className}>{value}</span>;
}
