const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Create a new post
// @route   POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags, author, isPublished } = req.body;

    const authorExists = await User.findById(author);
    if (!authorExists) {
      return res.status(404).json({ success: false, message: 'Author (user) not found' });
    }

    const post = await Post.create({ title, content, category, tags, author, isPublished });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published posts — supports ?category, ?tag, ?search, ?sort
// @route   GET /api/posts
const getPublishedPosts = async (req, res, next) => {
  try {
    const { category, tag, search, sort } = req.query;
    const filter = { isPublished: true };

    if (category) {
      filter.category = new RegExp(`^${category}$`, 'i'); // case-insensitive exact match
    }
    if (tag) {
      filter.tags = { $in: [new RegExp(`^${tag}$`, 'i')] };
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
      ];
    }

    let query = Post.find(filter).populate('author', 'name email');

    if (sort === 'popular') {
      query = query.sort({ likes: -1 });
    } else {
      query = query.sort({ createdAt: -1 }); // default / ?sort=latest
    }

    const posts = await query;

    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ALL posts including unpublished (admin use)
// @route   GET /api/posts/all
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate('author', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'All posts fetched successfully',
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single post with author + comments (and comment authors) populated
// @route   GET /api/posts/:id
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' },
      });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Post fetched successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post title, content, category, tags, or isPublished
// @route   PUT /api/posts/:id
const updatePost = async (req, res, next) => {
  try {
    const { title, content, category, tags, isPublished } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, category, tags, isPublished },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment likes by 1
// @route   PATCH /api/posts/:id/like
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle isPublished true/false
// @route   PATCH /api/posts/:id/publish
const togglePublish = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.isPublished = !post.isPublished;
    await post.save();

    res.status(200).json({
      success: true,
      message: `Post ${post.isPublished ? 'published' : 'unpublished'} successfully`,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post AND cascade-delete its comments
// @route   DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post and its comments deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPublishedPosts,
  getAllPosts,
  getPostById,
  updatePost,
  likePost,
  togglePublish,
  deletePost,
};
