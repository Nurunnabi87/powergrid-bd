import { z } from "zod";
import { codeRule } from "@/lib/validations/common";
import {
  CONNECTION_STATUSES,
  CONNECTION_TYPES,
  PRIORITY_TIERS,
  SUBSTATION_STATUSES,
} from "@/types/domain";

/**
 * Create/update schemas for the distribution hierarchy, mirroring each
 * API validator. Numeric inputs arrive as strings and are coerced.
 */

const nameRule = z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long");
const positive = (label: string) =>
  z.coerce.number({ error: `${label} must be a number` }).positive(`${label} must be greater than 0`);

export const zoneSchema = z.object({
  name: nameRule,
  code: codeRule,
  city: z.string().trim().min(2, "City must be at least 2 characters"),
  district: z.string().trim().max(100, "District must be at most 100 characters"),
});

export const substationSchema = z.object({
  name: nameRule,
  code: codeRule,
  zoneId: z.uuid("Choose a zone"),
  capacityMva: positive("Capacity"),
  status: z.enum(SUBSTATION_STATUSES),
});

export const feederSchema = z.object({
  name: nameRule,
  code: codeRule,
  substationId: z.uuid("Choose a substation"),
  voltageLevel: z.string().trim().regex(/^\d{1,3}kV$/i, "Use a voltage like 11kV or 33kV"),
  loadKw: positive("Load"),
});

export const areaSchema = z.object({
  name: nameRule,
  code: codeRule,
  feederId: z.uuid("Choose a feeder"),
  population: z.coerce.number({ error: "Population must be a number" }).int("Whole numbers only").min(0, "Cannot be negative"),
  priorityTier: z.enum(PRIORITY_TIERS),
});

export const connectionSchema = z.object({
  meterNo: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{4,24}$/, "4–24 characters: letters, numbers and dashes"),
  customerId: z.uuid("Choose a customer"),
  areaId: z.uuid("Choose an area"),
  connectionType: z.enum(CONNECTION_TYPES),
  tariffRate: positive("Tariff").max(100, "Tariff must be at most 100 BDT/kWh"),
  status: z.enum(CONNECTION_STATUSES),
});
