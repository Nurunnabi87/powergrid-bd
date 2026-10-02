import type { Metadata } from "next";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about load-shedding schedules, reporting outages, restoration times, bills, late fees and paying by card or bKash.",
  alternates: { canonical: "/faq" },
};

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Load shedding",
    items: [
      {
        q: "How do I find out when my area will lose power?",
        a: "Open the Load-shedding schedule page and search for your neighbourhood or feeder. Signed-in customers also see the upcoming slots for their own meters on their dashboard.",
      },
      {
        q: "Why is my area shed more often than others?",
        a: "Shedding follows each area's priority tier. When supply is short, LOW-priority feeders are shed first, then NORMAL, then HIGH. Feeders that serve a CRITICAL site such as a hospital are never shed.",
      },
      {
        q: "Can a schedule change after it is published?",
        a: "Yes. The control room can cancel a planned slot if supply recovers. Cancelled slots disappear from the public schedule and affected customers are notified.",
      },
    ],
  },
  {
    title: "Outages & repairs",
    items: [
      {
        q: "What is the difference between load shedding and an outage?",
        a: "Load shedding is planned and published in advance. An outage is unexpected — a fault, a fallen line or a failed transformer — and should be reported so a technician can be sent.",
      },
      {
        q: "How do I report an outage?",
        a: "Log in, open Outage reports and choose Report outage. Pick your area, describe the problem, set a severity and optionally attach a photo. You can then follow the report as it is acknowledged, assigned and restored.",
      },
      {
        q: "How will I know when power is restored?",
        a: "When the technician marks the job restored, every customer in the affected area receives a notification, and your report shows the restoration time and total downtime.",
      },
    ],
  },
  {
    title: "Bills & payments",
    items: [
      {
        q: "Which payment methods are accepted?",
        a: "You can pay by debit or credit card through Stripe Checkout, or with a bKash wallet. The bill is only marked paid after the payment is verified directly with the gateway.",
      },
      {
        q: "What happens if I pay after the due date?",
        a: "Unpaid bills past their due date become overdue and carry a 5% late fee, which is added to the total shown on the bill.",
      },
      {
        q: "I closed the payment page — was I charged?",
        a: "If you cancel or close the checkout, the bill returns to unpaid and you can try again. If the payment did go through, it is confirmed automatically and a receipt appears under Payments.",
      },
    ],
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        description="Quick answers about schedules, outages and paying your bill."
      />
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:px-8">
        {GROUPS.map((group) => (
          <section key={group.title} aria-labelledby={`faq-${group.title}`} className="space-y-3">
            <h2 id={`faq-${group.title}`} className="text-xl font-semibold">
              {group.title}
            </h2>
            <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
              {group.items.map((item, index) => (
                <AccordionItem key={item.q} value={`${group.title}-${index}`}>
                  <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
        <div className="flex flex-col items-start gap-3 rounded-xl border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Still need help?</p>
            <p className="text-sm text-muted-foreground">Our support team replies within one working day.</p>
          </div>
          <Button asChild>
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
