import type { Note } from '../models/note.model';
import type { NoteRepository } from '../repositories/note.repository';
import type { NoteFilters, NoteInput } from '../schemas/note.schema';
import { AppError } from '../utils/app-error';

export class NoteService {
  constructor(private readonly notes: NoteRepository) {}

  async list(userId: string, filters: NoteFilters): Promise<Note[]> {
    let result = await this.notes.findAllByUser(userId);

    const term = filters.q?.trim().toLowerCase();
    if (term) {
      const scope = filters.scope ?? 'all';
      result = result.filter((note) => {
        const inTitle = note.title.toLowerCase().includes(term);
        const inContent = note.content.toLowerCase().includes(term);
        const inTags = note.tags.some((tag) => tag.includes(term));
        if (scope === 'title') {
          return inTitle;
        }
        if (scope === 'content') {
          return inContent;
        }
        return inTitle || inContent || inTags;
      });
    }

    if (filters.category) {
      result = result.filter((note) => note.category === filters.category);
    }

    if (filters.tag) {
      const tag = filters.tag;
      result = result.filter((note) => note.tags.includes(tag));
    }

    if (filters.favorite === 'true') {
      result = result.filter((note) => note.favorite);
    }

    if (filters.from) {
      const from = new Date(`${filters.from}T00:00:00`);
      result = result.filter((note) => note.updatedAt >= from);
    }

    if (filters.to) {
      const to = new Date(`${filters.to}T23:59:59.999`);
      result = result.filter((note) => note.updatedAt <= to);
    }

    return this.sort(result, filters.sort ?? 'recent');
  }

  async get(userId: string, id: string): Promise<Note> {
    return this.getOwned(userId, id);
  }

  async create(userId: string, input: NoteInput): Promise<Note> {
    return this.notes.create(userId, this.normalize(input));
  }

  async update(userId: string, id: string, input: NoteInput): Promise<Note> {
    await this.getOwned(userId, id);
    const updated = await this.notes.update(id, this.normalize(input));
    if (!updated) {
      throw new AppError(404, 'Nota no encontrada');
    }
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id);
    await this.notes.delete(id);
  }

  private normalize(input: NoteInput): NoteInput {
    return { ...input, tags: [...new Set(input.tags)] };
  }

  private sort(notes: Note[], order: 'recent' | 'oldest' | 'title'): Note[] {
    const copy = [...notes];
    if (order === 'title') {
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'es'));
    }
    if (order === 'oldest') {
      return copy.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    }
    return copy.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  private async getOwned(userId: string, id: string): Promise<Note> {
    const note = await this.notes.findById(id);
    if (!note || note.userId !== userId) {
      throw new AppError(404, 'Nota no encontrada');
    }
    return note;
  }
}