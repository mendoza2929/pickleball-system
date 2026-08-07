import { z } from "zod";

export const registerSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  username: z.string().min(4),
  email: z.email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;