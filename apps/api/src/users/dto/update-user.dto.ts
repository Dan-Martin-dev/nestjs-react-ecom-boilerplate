import { z } from 'zod';

// Zod Schema for validation
export const UpdateUserSchema = z.object({
  // Users can update their name. It must be a string and at least 2 chars long.
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
  
  // NEVER include fields like 'role', 'email', or 'password' in a general update DTO.
  // These should be handled by dedicated, highly-protected endpoints if needed.
});

// Create a TypeScript type from the Zod schema for type-safety in our service/controller
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;