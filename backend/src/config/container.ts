import { InMemoryNoteRepository } from '../repositories/note.repository';
import { InMemoryUserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import { NoteService } from '../services/note.service';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET no está definido en el archivo .env');
}

const userRepository = new InMemoryUserRepository();
const noteRepository = new InMemoryNoteRepository();

export const authService = new AuthService(userRepository, jwtSecret);
export const noteService = new NoteService(noteRepository);