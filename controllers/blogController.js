import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

export const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user._id
    });
    
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'username');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username');
      
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Fetch comments separately
    const comments = await Comment.find({
      targetType: 'Blog',
      targetId: blog._id
    }).populate('user', 'username');

    // Combine blog and comments
    const blogWithComments = {
      ...blog.toObject(),
      comments
    };

    res.json(blogWithComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Delete all comments related to this blog
    await Comment.deleteMany({
      targetType: 'Blog',
      targetId: blog._id
    });

    // Delete the blog document
    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog and associated comments deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: error.message });
  }
};