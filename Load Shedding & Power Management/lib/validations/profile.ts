import { z } from "zod";
import { addressRule, nameRule, optionalPhoneRule } from "@/lib/validations/common";

/** Mirrors PATCH /users/me (email and role are not editable). */
export const profileSchema = z.object({
  name: nameRule,
  phone: optionalPhoneRule,
  address: addressRule,
});
export type ProfileValues = z.infer<typeof profileSchema>;

/** Mirrors PATCH /users/me/technician-profile. */
export const technicianProfileSchema = z.object({
  isAvailable: z.boolean(),
  specialization: z
    .string()
    .trim()
    .min(2, "Specialization must be at least 2 characters")
    .max(100, "Specialization must be at most 100 characters"),
});
export type TechnicianProfileValues = z.infer<typeof technicianProfileSchema>;
