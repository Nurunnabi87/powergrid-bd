import Image from "next/image";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  src?: string | null;
  /** Rendered pixel size (square). */
  size?: number;
  className?: string;
}

/** Avatar via next/image (optimised Cloudinary delivery) with initials fallback. */
export function UserAvatar({ name, src, size = 32, className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20 font-semibold text-foreground",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) }}
    >
      {src ? (
        <Image src={src} alt={`${name}'s avatar`} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}
