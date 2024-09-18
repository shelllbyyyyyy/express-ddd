import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(4).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

export type UserSchema = z.infer<typeof userSchema>;
