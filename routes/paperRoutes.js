import express from 'express';
import { 
  uploadPaper, 
  getPapers, 
  downloadPaper,
  viewPaper,
  deletePaper
} from '../controllers/paperController.js';
import upload, { handleGridFSUpload } from '../middleware/storage.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(
    protect,
    upload.single('pdf'), 
    handleGridFSUpload, 
    uploadPaper
  )
  .get(getPapers);

router.route('/:id/download')
  .get(downloadPaper);

router.route('/:id/view')
  .get(viewPaper);

router.route('/:id')
  .delete(protect, admin, deletePaper);

export default router;