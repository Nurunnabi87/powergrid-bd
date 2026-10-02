import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const metadata: Metadata = {
  title: { default: "Payment", template: "%s | PowerGrid BD" },
  robots: { index: false },
};

/** Focused layout for gateway return pages (no dashboard chrome). */
export default function PaymentLayout({ children }: LayoutProps<"/payment">) {
  return (
    <div className="bg-grid relative flex min-h-dvh flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" aria-hidden />
      <header className="relative flex items-center justify-between px-4 py-4 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="relative flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:items-center">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
