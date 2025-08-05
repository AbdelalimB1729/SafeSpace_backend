import express from 'express';
import { 
  createComment, 
  getComments,
  deleteComment
} from '../controllers/commentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createComment);

router.route('/:type/:id')
  .get(getComments);

router.route('/:id')
  .delete((req, res, next) => {
    console.log('Comment route: DELETE request received for ID:', req.params.id);
    console.log('Comment route: Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    next();
  }, protect, admin, deleteComment);

export default router;