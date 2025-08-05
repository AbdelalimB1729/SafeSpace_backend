import multer from 'multer';
import { getStorage } from '../config/gridfs.js';

// Create upload middleware directly
export default multer({ 
  storage: getStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});