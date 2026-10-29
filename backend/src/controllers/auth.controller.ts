import type { Request, Response } from 'express';
import { authService } from '../config/container';
import { credentialsSchema } from '../schemas/auth.schema';

export const register = async (req: Request, res: Response): Promise<void> => {
  const credentials = credentialsSchema.parse(req.body);
  const result = await authService.register(credentials);
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const credentials = credentialsSchema.parse(req.body);
  const result = await authService.login(credentials);
  res.json(result);
};