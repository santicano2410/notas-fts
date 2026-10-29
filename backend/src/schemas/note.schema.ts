import { z } from 'zod';

export const noteInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(20000),
});

export const noteIdSchema = z.object({
  id: z.uuid(),
});

export const noteQuerySchema = z.object({
  q: z.string().optional(),
});

export type NoteInput = z.infer<typeof noteInputSchema>;