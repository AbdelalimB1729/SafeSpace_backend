import Paper from '../models/Paper.js';
import Comment from '../models/Comment.js';
import mongoose from 'mongoose';
import { getBucket } from '../config/gridfs.js';

export const uploadPaper = async (req, res) => {
  try {
    if (!req.gridfsFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const paper = await Paper.create({
      title: req.body.title,
      description: req.body.description,
      fileId: req.gridfsFile.id,
      filename: req.gridfsFile.filename,
      uploader: req.user._id
    });

    // Populate uploader information
    const populatedPaper = await Paper.findById(paper._id)
      .populate('uploader', 'username');
      
    res.status(201).json(populatedPaper);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getPapers = async (req, res) => {
  try {
    const papers = await Paper.find().populate('uploader', 'username');
    res.json(papers);
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const downloadPaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: 'Paper not found' });

    const bucket = getBucket();
    const downloadStream = bucket.openDownloadStream(paper.fileId);
    
    downloadStream.on('error', (error) => {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ message: 'File not found' });
      }
      console.error('Download error:', error);
      res.status(500).json({ message: 'Internal server error' });
    });

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${paper.filename}"`);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download controller error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const viewPaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: 'Paper not found' });

    const bucket = getBucket();
    const downloadStream = bucket.openDownloadStream(paper.fileId);
    
    downloadStream.on('error', (error) => {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ message: 'File not found' });
      }
      console.error('View error:', error);
      res.status(500).json({ message: 'Internal server error' });
    });

    // Set headers for inline viewing instead of download
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${paper.filename}"`);
    res.set('Cache-Control', 'no-cache');
    downloadStream.pipe(res);
  } catch (error) {
    console.error('View controller error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Delete the PDF file from GridFS
    const bucket = getBucket();
    try {
      await bucket.delete(paper.fileId);
    } catch (gridfsError) {
      console.error('Error deleting file from GridFS:', gridfsError);
      // Continue with paper deletion even if file deletion fails
    }

    // Delete all comments related to this paper
    await Comment.deleteMany({
      targetType: 'Paper',
      targetId: paper._id
    });

    // Delete the paper document
    await Paper.findByIdAndDelete(req.params.id);

    res.json({ message: 'Paper and associated comments deleted successfully' });
  } catch (error) {
    console.error('Delete paper error:', error);
    res.status(500).json({ message: error.message });
  }
};