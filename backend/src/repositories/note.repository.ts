import { randomUUID } from 'node:crypto';
import type { Note } from '../models/note.model';
import type { NoteInput } from '../schemas/note.schema';

export interface NoteRepository {
  findAllByUser(userId: string): Promise<Note[]>;
  findById(id: string): Promise<Note | null>;
  create(userId: string, input: NoteInput): Promise<Note>;
  update(id: string, input: NoteInput): Promise<Note | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryNoteRepository implements NoteRepository {
  private notes: Note[] = [];

  async findAllByUser(userId: string): Promise<Note[]> {
    return this.notes
      .filter((note) => note.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async findById(id: string): Promise<Note | null> {
    return this.notes.find((note) => note.id === id) ?? null;
  }

  async create(userId: string, input: NoteInput): Promise<Note> {
    const now = new Date();
    const note: Note = {
      id: randomUUID(),
      userId,
      title: input.title,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.push(note);
    return note;
  }

  async update(id: string, input: NoteInput): Promise<Note | null> {
    const current = this.notes.find((note) => note.id === id);
    if (!current) {
      return null;
    }
    const updated: Note = {
      ...current,
      title: input.title,
      content: input.content,
      updatedAt: new Date(),
    };
    this.notes = this.notes.map((note) => (note.id === id ? updated : note));
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const before = this.notes.length;
    this.notes = this.notes.filter((note) => note.id !== id);
    return this.notes.length < before;
  }
}