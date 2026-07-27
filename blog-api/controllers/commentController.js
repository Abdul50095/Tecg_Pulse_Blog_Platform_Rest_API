const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Add a comment to a post
// @route   POST /api/comments
const createComment = async (req, res, next) => {
  try {
    const { text, author, post } = req.body;

    const [authorExists, postDoc] = await Promise.all([
      User.findById(author),
      Post.findById(post),
    ]);

    if (!authorExists) {
      return res.status(404).json({ success: false, message: 'Author (user) not found' });
    }
    if (!postDoc) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({ text, author, post });

    // Keep Post.comments in sync so getPostById's populate() has it available
    postDoc.comments.push(comment._id);
    await postDoc.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments for a specific post, with author name populated
// @route   GET /api/comments/post/:postId
const getCommentsByPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: 'Comments fetched successfully',
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a comment's text
// @route   PUT /api/comments/:id
const updateComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { text },
      { new: true, runValidators: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment AND remove its reference from the parent post
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
};
