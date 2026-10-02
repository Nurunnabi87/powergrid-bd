"use client";

import { OutageList } from "@/components/outages/outage-list";
import { JobActions } from "@/components/technician/job-actions";

export function TechnicianJobList() {
  return (
    <OutageList
      scope="assigned"
      basePath="/technician/jobs"
      renderActions={(outage) => <JobActions outage={outage} size="sm" />}
      emptyTitle="No jobs assigned to you"
      emptyDescription="When the control room dispatches you to an outage, it will appear here."
    />
  );
}
