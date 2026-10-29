import type { Note } from '../models/note.model';
import type { NoteRepository } from '../repositories/note.repository';
import type { NoteInput } from '../schemas/note.schema';
import { AppError } from '../utils/app-error';

export class NoteService {
  constructor(private readonly notes: NoteRepository) {}

  async list(userId: string, query?: string): Promise<Note[]> {
    const all = await this.notes.findAllByUser(userId);
    const term = query?.trim().toLowerCase();
    if (!term) {
      return all;
    }
    return all.filter(
      (note) =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term),
    );
  }

  async get(userId: string, id: string): Promise<Note> {
    return this.getOwned(userId, id);
  }

  async create(userId: string, input: NoteInput): Promise<Note> {
    return this.notes.create(userId, input);
  }

  async update(userId: string, id: string, input: NoteInput): Promise<Note> {
    await this.getOwned(userId, id);
    const updated = await this.notes.update(id, input);
    if (!updated) {
      throw new AppError(404, 'Nota no encontrada');
    }
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id);
    await this.notes.delete(id);
  }

  private async getOwned(userId: string, id: string): Promise<Note> {
    const note = await this.notes.findById(id);
    if (!note || note.userId !== userId) {
      throw new AppError(404, 'Nota no encontrada');
    }
    return note;
  }
}