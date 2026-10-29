import { InMemoryUserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET no está definido en el archivo .env');
}

const userRepository = new InMemoryUserRepository();

export const authService = new AuthService(userRepository, jwtSecret);