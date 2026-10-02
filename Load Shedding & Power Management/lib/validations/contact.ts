import { z } from "zod";
import { emailRule, nameRule, optionalPhoneRule } from "@/lib/validations/common";

/** Mirrors POST /public/contact. */
export const contactSchema = z.object({
  name: nameRule,
  email: emailRule,
  phone: optionalPhoneRule,
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(150, "Subject must be at most 150 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
});

export type ContactValues = z.infer<typeof contactSchema>;
