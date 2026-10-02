import { z } from "zod";

/** Mirrors POST /bills/generate. */
export const generateBillsSchema = z.object({
  billingPeriod: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose a billing month"),
  dueDate: z.iso.date("Choose a due date"),
  areaId: z.union([z.literal("all"), z.uuid()]),
  defaultUnits: z.union([
    z.literal(""),
    z.coerce.number({ error: "Units must be a number" }).positive("Units must be greater than 0").max(100000, "At most 100,000 kWh"),
  ]),
});
export type GenerateBillsInput = z.input<typeof generateBillsSchema>;
export type GenerateBillsValues = z.output<typeof generateBillsSchema>;
