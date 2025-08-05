import express from 'express';
import { 
  createBlog, 
  getBlogs, 
  getBlogById,
  deleteBlog
} from '../controllers/blogController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, createBlog)
  .get(getBlogs);

router.route('/:id')
  .get(getBlogById)
  .delete(protect, admin, deleteBlog);

export default router;