import { z } from "zod";

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(8).max(255),
  newPassword: z.string().min(8).max(255),
});

export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
