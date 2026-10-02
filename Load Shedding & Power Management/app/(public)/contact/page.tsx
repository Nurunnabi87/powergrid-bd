import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/contact-form";
import { PageHero } from "@/components/marketing/section";
import { publicGet } from "@/lib/api/server";
import { siteConfig } from "@/lib/site";
import type { PublicZone } from "@/types/domain";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact PowerGrid BD support about outages, schedules, billing or your account. Hotline 16999, available 24/7.",
  alternates: { canonical: "/contact" },
};

export const revalidate = 600;

export default async function ContactPage() {
  const zones = (await publicGet<PublicZone[]>("/public/zones", undefined, 600))?.data ?? [];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We're here around the clock"
        description="For a power cut in your area, report an outage from your dashboard so a technician can be dispatched. For everything else, send us a message."
      />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>Billing questions, account help or feedback about a schedule.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Phone className="mt-0.5 size-5 text-muted-foreground" aria-hidden />
                <div>
                  <p className="font-medium">Hotline {siteConfig.hotline}</p>
                  <p className="text-sm text-muted-foreground">Outages and emergencies, 24/7</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 size-5 text-muted-foreground" aria-hidden />
                <div>
                  <a href={`mailto:${siteConfig.supportEmail}`} className="font-medium hover:underline">
                    {siteConfig.supportEmail}
                  </a>
                  <p className="text-sm text-muted-foreground">Replies within one working day</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 size-5 text-muted-foreground" aria-hidden />
                <div>
                  <p className="font-medium">Customer centres</p>
                  <p className="text-sm text-muted-foreground">Sun–Thu, 9:00 AM – 5:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {zones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zone offices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {zones.map((zone) => (
                    <li key={zone.id} className="flex gap-3">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div>
                        <p className="text-sm font-medium">
                          {zone.name} <span className="font-mono text-xs text-muted-foreground">{zone.code}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {zone.city}
                          {zone.district && zone.district !== zone.city ? `, ${zone.district}` : ""} · {zone._count.substations} substations
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
