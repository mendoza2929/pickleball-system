import { z } from "zod";

export const createCustomerSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(100, "First name is too long."),

  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(100, "Last name is too long."),

  email: z
    .string()
    .trim()
    .email("Invalid email address.")
    .max(150)
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),

  status: z
    .enum(["Active", "Inactive"])
    .default("Active"),

  notes: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export const updateCustomerSchema =
  createCustomerSchema.partial();

export const customerListSchema = z.object({
  search: z.string().optional(),

  status: z
    .enum(["Active", "Inactive"])
    .optional(),

  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),
});

export type CreateCustomerInput =
  z.infer<typeof createCustomerSchema>;

export type UpdateCustomerInput =
  z.infer<typeof updateCustomerSchema>;