import { z } from "zod";

/**
 * Field rules shared by several forms. Each one mirrors the API's own Zod
 * validator, so a value the form accepts is a value the API accepts.
 */

export const nameRule = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be at most 100 characters");

export const emailRule = z.email("Enter a valid email address").trim().toLowerCase();

/** API: min 8, at least one letter and one number. */
export const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/** API: /^01[3-9]\d{8}$/ */
export const bdPhoneRule = z
  .string()
  .trim()
  .regex(/^01[3-9]\d{8}$/, "Enter a valid BD mobile number, e.g. 01712345678");

/** Optional in forms: an empty input means "not provided". */
export const optionalPhoneRule = z.union([z.literal(""), bdPhoneRule]);

export const addressRule = z.string().trim().max(255, "Address must be at most 255 characters");

/** API: uppercased, then /^[A-Z0-9-]{2,20}$/ */
export const codeRule = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{2,20}$/, "2–20 characters: letters, numbers and dashes");

export const uuidRule = (label: string) => z.uuid(`Select a ${label}`);

/** Images accepted by the API (JPEG/PNG/WebP). 4 MB keeps uploads under Vercel's body limit. */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const imageFileRule = z
  .instanceof(File)
  .refine((file) => IMAGE_TYPES.includes(file.type), "Only JPEG, PNG or WebP images are allowed")
  .refine((file) => file.size <= MAX_IMAGE_BYTES, "Image must be 4 MB or smaller");
