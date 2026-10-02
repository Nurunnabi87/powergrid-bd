import { z } from "zod";

const timeRule = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a time as HH:MM");
const dateRule = z.iso.date("Choose a date");

/**
 * POST /schedules. Times are entered in Bangladesh time and converted to
 * the UTC ISO strings the API requires on submit.
 */
export const scheduleSchema = z
  .object({
    feederId: z.uuid("Choose a feeder"),
    date: dateRule,
    startTime: timeRule,
    endTime: timeRule,
    reason: z.string().trim().max(255, "Reason must be at most 255 characters"),
  })
  .refine((values) => values.endTime > values.startTime, {
    path: ["endTime"],
    message: "End time must be after the start time",
  });
export type ScheduleValues = z.infer<typeof scheduleSchema>;

/** POST /schedules/generate (wizard). */
export const generateZoneSchema = z.object({ zoneId: z.uuid("Choose a zone") });

export const generateParamsSchema = z.object({
  date: dateRule,
  totalDeficitMw: z.coerce
    .number({ error: "Enter the supply deficit in MW" })
    .positive("Deficit must be greater than 0")
    .max(10000, "Deficit must be at most 10,000 MW"),
  slotHours: z.coerce.number().int("Whole hours only").min(1, "At least 1 hour").max(12, "At most 12 hours"),
  startHour: z.coerce.number().int().min(0).max(23),
});

export const generateSchema = generateZoneSchema.extend(generateParamsSchema.shape);
export type GenerateInput = z.input<typeof generateSchema>;
export type GenerateValues = z.output<typeof generateSchema>;
