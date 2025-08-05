import mongoose from 'mongoose';

let gfsBucket = null;

export const initGridFS = () => {
  const conn = mongoose.connection;
  gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'pdfs'
  });
  console.log('GridFS Bucket initialized');
};

export const getBucket = () => {
  if (!gfsBucket) {
    throw new Error('GridFS Bucket not initialized');
  }
  return gfsBucket;
};