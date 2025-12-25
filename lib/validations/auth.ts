import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

const baseRegisterSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Confirm password is required" }),
  phone: z.string().trim().min(6, { message: "Phone number is required" }),
  address: z.string().trim().min(4, { message: "Address is required" }),
})

export const registerSchema = z
  .discriminatedUnion("role", [
    baseRegisterSchema.extend({
      role: z.literal("customer"),
      name: z.string().trim().min(2, { message: "Name must be at least 2 characters long" }),
    }),
    baseRegisterSchema.extend({
      role: z.literal("installer"),
      companyName: z.string().trim().min(2, { message: "Company name must be at least 2 characters long" }),
      registrationNumber: z
        .string()
        .trim()
        .min(2, { message: "Registration number must be at least 2 characters long" }),
      description: z.string().trim().min(10, { message: "Description must be at least 10 characters" }),
    }),
  ])
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    }
  })
