export const siteConfig = {
  name: "PowerGrid BD",
  tagline: "Load-shedding & outage management",
  description:
    "PowerGrid BD publishes load-shedding schedules, takes outage reports, dispatches technicians and settles electricity bills for a national distribution network.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supportEmail: "support@powergrid.bd",
  hotline: "16999",
};
