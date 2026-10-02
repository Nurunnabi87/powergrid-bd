import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent vertical rhythm and heading style for marketing sections. */
export function Section({
  eyebrow,
  title,
  description,
  children,
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl space-y-3">
          {eyebrow && (
            <p className="text-sm font-semibold tracking-wide text-[color-mix(in_oklch,var(--primary),black_35%)] uppercase dark:text-primary">
              {eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
          {description && <p className="text-lg text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Page-top banner for inner public pages. */
export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: ReactNode }) {
  return (
    <section className="bg-grid relative border-b">
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-sm font-semibold tracking-wide text-[color-mix(in_oklch,var(--primary),black_35%)] uppercase dark:text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
