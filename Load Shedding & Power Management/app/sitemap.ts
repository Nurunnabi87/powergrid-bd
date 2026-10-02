import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** Public, indexable pages only; dashboards are private and noindex. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; changeFrequency: "hourly" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1, changeFrequency: "hourly" },
    { path: "/schedule", priority: 0.9, changeFrequency: "hourly" },
    { path: "/services", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
    { path: "/register", priority: 0.4, changeFrequency: "monthly" },
    { path: "/login", priority: 0.3, changeFrequency: "monthly" },
  ];

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
