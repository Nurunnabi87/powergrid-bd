import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/site";

const COLUMNS = [
  {
    title: "For customers",
    links: [
      { href: "/schedule", label: "Today's schedule" },
      { href: "/register", label: "Create an account" },
      { href: "/login", label: "Report an outage" },
      { href: "/faq", label: "Billing & payments FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About PowerGrid BD" },
      { href: "/services", label: "Services" },
      { href: "/contact", label: "Contact support" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Load-shedding schedules, outage reporting and bill payment for the national distribution network.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title} className="space-y-3">
            <h2 className="text-sm font-semibold">{column.title}</h2>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">24/7 support</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="size-4" aria-hidden /> Hotline {siteConfig.hotline}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" aria-hidden />
              <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-foreground">
                {siteConfig.supportEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {siteConfig.name}. Built for the B7A7 full-stack assignment — demo data only.
        </p>
      </div>
    </footer>
  );
}
