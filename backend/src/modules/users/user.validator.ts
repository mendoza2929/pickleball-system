import { z } from "zod";


// =====================================================
// UPDATE PROFILE
// =====================================================

export const updateProfileSchema = z.object({

  first_name: z
    .string()
    .trim()
    .min(
      2,
      "First name must be at least 2 characters."
    )
    .max(100),

  last_name: z
    .string()
    .trim()
    .min(
      2,
      "Last name must be at least 2 characters."
    )
    .max(100),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),

});


// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePasswordSchema = z
  .object({

    current_password: z
      .string()
      .min(
        1,
        "Current password is required."
      ),

    new_password: z
      .string()
      .min(
        8,
        "New password must be at least 8 characters."
      )
      .max(
        100,
        "New password is too long."
      ),

    confirm_password: z
      .string()
      .min(
        1,
        "Please confirm your new password."
      ),

  })
  .refine(
    (data) =>
      data.new_password ===
      data.confirm_password,
    {
      message:
        "New passwords do not match.",
      path: [
        "confirm_password",
      ],
    }
  );


// =====================================================
// TYPES
// =====================================================

export type UpdateProfileInput =
  z.infer<
    typeof updateProfileSchema
  >;


export type ChangePasswordInput =
  z.infer<
    typeof changePasswordSchema
  >;