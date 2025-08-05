import multer from 'multer';
import { getBucket } from '../config/gridfs.js';
import mongoose from 'mongoose';

const storage = multer.memoryStorage(); // Store files in memory

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Handle file upload to GridFS
export const handleGridFSUpload = (req, res, next) => {
  if (!req.file) return next();
  
  const bucket = getBucket();
  const filename = `${Date.now()}-${req.file.originalname}`;
  
  const uploadStream = bucket.openUploadStream(filename, {
    metadata: {
      userId: req.user?._id,
      originalName: req.file.originalname
    }
  });
  
  uploadStream.end(req.file.buffer);
  
  uploadStream.on('error', (error) => {
    console.error('GridFS upload error:', error);
    return next(error);
  });
  
  uploadStream.on('finish', () => {
    req.gridfsFile = {
      id: uploadStream.id,
      filename: filename,
      metadata: {
        userId: req.user?._id,
        originalName: req.file.originalname
      }
    };
    next();
  });
};

export default upload;