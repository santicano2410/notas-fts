export const NOTE_CATEGORIES = ['personal', 'estudio', 'trabajo', 'ideas', 'otros'] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}