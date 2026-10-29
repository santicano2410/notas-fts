import { Router } from 'express';
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from '../controllers/note.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', listNotes);
router.get('/:id', getNote);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;