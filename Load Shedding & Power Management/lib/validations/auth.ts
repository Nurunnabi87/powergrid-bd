import { z } from "zod";
import {
  addressRule,
  emailRule,
  nameRule,
  optionalPhoneRule,
  passwordRule,
} from "@/lib/validations/common";

export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: nameRule,
    email: emailRule,
    phone: optionalPhoneRule,
    address: addressRule,
    password: passwordRule,
    // Frontend-only: the API has no confirmPassword field.
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((values) => values.newPassword !== values.oldPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current one",
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
