import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '../models/user.model';
import type { UserRepository } from '../repositories/user.repository';
import type { Credentials } from '../schemas/auth.schema';
import { AppError } from '../utils/app-error';

export interface AuthResponse {
  accessToken: string;
  user: { email: string };
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtSecret: string,
  ) {}

  async register(credentials: Credentials): Promise<AuthResponse> {
    const existing = await this.users.findByEmail(credentials.email);
    if (existing) {
      throw new AppError(409, 'El correo ya está registrado');
    }
    const passwordHash = await bcrypt.hash(credentials.password, 12);
    const user = await this.users.create(credentials.email, passwordHash);
    return this.buildResponse(user);
  }

  async login(credentials: Credentials): Promise<AuthResponse> {
    const user = await this.users.findByEmail(credentials.email);
    if (!user) {
      throw new AppError(401, 'Credenciales inválidas');
    }
    const valid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Credenciales inválidas');
    }
    return this.buildResponse(user);
  }

  verifyToken(token: string): string {
    try {
      const payload = jwt.verify(token, this.jwtSecret);
      if (typeof payload === 'string' || typeof payload.sub !== 'string') {
        throw new AppError(401, 'Token inválido');
      }
      return payload.sub;
    } catch {
      throw new AppError(401, 'Token inválido o expirado');
    }
  }

  private buildResponse(user: User): AuthResponse {
    const accessToken = jwt.sign({ sub: user.id }, this.jwtSecret, {
      expiresIn: '15m',
    });
    return { accessToken, user: { email: user.email } };
  }
}