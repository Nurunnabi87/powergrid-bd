import type { Metadata } from "next";
import { NotificationsPage } from "@/components/notifications/notifications-page";

export const metadata: Metadata = { title: "Notifications" };

export default async function Page({ searchParams }: PageProps<"/dashboard/notifications">) {
  return <NotificationsPage searchParams={await searchParams} />;
}
