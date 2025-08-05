import Comment from '../models/Comment.js';

export const createComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      content: req.body.content,
      user: req.user._id,
      targetType: req.body.targetType,
      targetId: req.body.targetId
    });
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username');
      
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      targetType: req.params.type,
      targetId: req.params.id
    }).populate('user', 'username');
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    console.log('Delete comment controller: Starting deletion for ID:', req.params.id);
    console.log('Delete comment controller: User:', req.user?.username, 'Role:', req.user?.role);
    
    const comment = await Comment.findById(req.params.id);
    console.log('Delete comment controller: Comment found:', !!comment);
    
    if (!comment) {
      console.log('Delete comment controller: Comment not found');
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Delete the comment
    console.log('Delete comment controller: Attempting to delete comment...');
    await Comment.findByIdAndDelete(req.params.id);
    console.log('Delete comment controller: Comment deleted successfully');

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment controller error:', error);
    res.status(500).json({ message: error.message });
  }
};