import { z } from 'zod';
import { NOTE_CATEGORIES } from '../models/note.model';

export const noteInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(20000),
  category: z.enum(NOTE_CATEGORIES).default('otros'),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(5).default([]),
  favorite: z.boolean().default(false),
});

export const noteIdSchema = z.object({
  id: z.uuid(),
});

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const noteQuerySchema = z.object({
  q: z.string().optional(),
  scope: z.enum(['all', 'title', 'content']).optional(),
  category: z.enum(NOTE_CATEGORIES).optional(),
  tag: z.string().trim().toLowerCase().optional(),
  favorite: z.enum(['true', 'false']).optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  sort: z.enum(['recent', 'oldest', 'title']).optional(),
});

export type NoteInput = z.infer<typeof noteInputSchema>;
export type NoteFilters = z.infer<typeof noteQuerySchema>;