import { z } from "zod";
import { imageFileRule } from "@/lib/validations/common";
import { OUTAGE_SEVERITIES } from "@/types/domain";

/** Mirrors POST /outages/report (multipart). */
export const reportOutageSchema = z.object({
  areaId: z.uuid("Choose the area where power is out"),
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title must be at most 150 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Describe the problem in at least 10 characters")
    .max(1000, "Description must be at most 1000 characters"),
  severity: z.enum(OUTAGE_SEVERITIES, { error: "Choose a severity" }),
  photo: imageFileRule.nullable(),
});
export type ReportOutageValues = z.infer<typeof reportOutageSchema>;

/** Fields validated at each wizard step. */
export const REPORT_STEP_FIELDS = [["areaId"], ["title", "description", "severity"], ["photo"]] as const;

/** Optional note sent with status changes and restoration (API: max 500). */
export const noteSchema = z.object({
  note: z.string().trim().max(500, "Note must be at most 500 characters"),
});
export type NoteValues = z.infer<typeof noteSchema>;

/** POST /outages/:id/assign */
export const assignSchema = z.object({
  technicianId: z.uuid("Choose a technician"),
  notes: z.string().trim().max(500, "Notes must be at most 500 characters"),
});
export type AssignValues = z.infer<typeof assignSchema>;
