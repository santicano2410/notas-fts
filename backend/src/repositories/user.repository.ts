import { randomUUID } from 'node:crypto';
import type { User } from '../models/user.model';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(email: string, passwordHash: string): Promise<User>;
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const user: User = {
      id: randomUUID(),
      email,
      passwordHash,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }
}