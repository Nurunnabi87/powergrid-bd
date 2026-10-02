"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Cable, Factory, Gauge, MapPinned } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceTable } from "@/components/admin/network/resource-table";
import { NETWORK_META, NETWORK_TABS, type NetworkTab } from "@/lib/network-resources";

const ICONS: Record<NetworkTab, typeof Cable> = {
  zones: MapPinned,
  substations: Factory,
  feeders: Cable,
  areas: Building2,
  connections: Gauge,
};

/** The active tab lives in the URL (?tab=), so each level is linkable. */
export function NetworkTabs({ tab }: { tab: NetworkTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <Tabs
      value={tab}
      onValueChange={(next) =>
        // Switching level drops the previous level's search and filters.
        startTransition(() => router.replace(`${pathname}?tab=${next}`, { scroll: false }))
      }
      className="gap-4"
    >
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList aria-label="Network level">
          {NETWORK_TABS.map((key) => {
            const Icon = ICONS[key];
            return (
              <TabsTrigger key={key} value={key} disabled={isPending}>
                <Icon /> {NETWORK_META[key].label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      <ResourceTable key={tab} tab={tab} />
    </Tabs>
  );
}
