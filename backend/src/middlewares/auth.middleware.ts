import type { NextFunction, Request, Response } from 'express';
import { authService } from '../config/container';
import { AppError } from '../utils/app-error';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'Token requerido');
  }
  const token = header.slice('Bearer '.length);
  res.locals.userId = authService.verifyToken(token);
  next();
};

export const getUserId = (res: Response): string => {
  const userId: unknown = res.locals.userId;
  if (typeof userId !== 'string') {
    throw new AppError(401, 'No autenticado');
  }
  return userId;
};