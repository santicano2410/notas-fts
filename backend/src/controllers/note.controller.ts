import type { Request, Response } from 'express';
import { noteService } from '../config/container';
import { getUserId } from '../middlewares/auth.middleware';
import {
  noteIdSchema,
  noteInputSchema,
  noteQuerySchema,
} from '../schemas/note.schema';

export const listNotes = async (req: Request, res: Response): Promise<void> => {
  const { q } = noteQuerySchema.parse(req.query);
  const notes = await noteService.list(getUserId(res), q);
  res.json(notes);
};

export const getNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = noteIdSchema.parse(req.params);
  const note = await noteService.get(getUserId(res), id);
  res.json(note);
};

export const createNote = async (req: Request, res: Response): Promise<void> => {
  const input = noteInputSchema.parse(req.body);
  const note = await noteService.create(getUserId(res), input);
  res.status(201).json(note);
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = noteIdSchema.parse(req.params);
  const input = noteInputSchema.parse(req.body);
  const note = await noteService.update(getUserId(res), id, input);
  res.json(note);
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = noteIdSchema.parse(req.params);
  await noteService.remove(getUserId(res), id);
  res.status(204).send();
};