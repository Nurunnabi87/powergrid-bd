"use client";

import { useTransition, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChartColumn, History, Inbox } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ReportTab = "analytics" | "audit" | "messages";

/** URL-backed tabs (?tab=) for the reports page; content is rendered by the server page. */
export function ReportTabs({ tab, children }: { tab: ReportTab; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => startTransition(() => router.replace(`${pathname}?tab=${next}`, { scroll: false }))}
      className="gap-4"
    >
      <TabsList aria-label="Report">
        <TabsTrigger value="analytics" disabled={isPending}>
          <ChartColumn /> Analytics
        </TabsTrigger>
        <TabsTrigger value="audit" disabled={isPending}>
          <History /> Audit log
        </TabsTrigger>
        <TabsTrigger value="messages" disabled={isPending}>
          <Inbox /> Messages
        </TabsTrigger>
      </TabsList>
      <TabsContent value={tab} className={isPending ? "opacity-60 transition-opacity" : undefined}>
        {children}
      </TabsContent>
    </Tabs>
  );
}
