"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, LogIn, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ROLE_HOME, isRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export const PUBLIC_LINKS = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Load-shedding schedule" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

function useAuthProbe() {
  return useQuery({
    queryKey: ["auth-probe"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      return (await response.json()) as { authenticated: boolean; role: string | null };
    },
    staleTime: 60_000,
  });
}

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data } = useAuthProbe();
  const dashboardHref = data?.authenticated && isRole(data.role) ? ROLE_HOME[data.role] : null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const authButtons = dashboardHref ? (
    <Button asChild>
      <Link href={dashboardHref}>
        <LayoutDashboard /> Dashboard
      </Link>
    </Button>
  ) : (
    <>
      <Button variant="ghost" asChild>
        <Link href="/login">
          <LogIn /> Log in
        </Link>
      </Button>
      <Button asChild>
        <Link href="/register">Get started</Link>
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(link.href) && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">{authButtons}</div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {PUBLIC_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted",
                      isActive(link.href) && "bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 flex flex-col gap-2 px-4 [&_a]:w-full" onClick={() => setOpen(false)}>
                {authButtons}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
