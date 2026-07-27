const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, bio, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const user = await User.create({ name, email, password, bio, role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login with email + password (no JWT yet — plain data response)
// @route   POST /api/users/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Deliberately vague message so we don't reveal whether the email exists
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (never expose passwords)
// @route   GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email bio role');

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user with their published posts populated
// @route   GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email bio role createdAt')
      .populate({
        path: 'posts', // virtual defined in models/User.js
        match: { isPublished: true },
        select: 'title category tags likes createdAt',
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user name, bio, or role only
// @route   PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, bio, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio, role },
      { new: true, runValidators: true }
    ).select('name email bio role');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user AND cascade-delete their posts + comments
// @route   DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const posts = await Post.find({ author: user._id }).select('_id');
    const postIds = posts.map((post) => post._id);

    // Remove every comment that either belongs to one of this user's posts,
    // or was written by this user on someone else's post.
    await Comment.deleteMany({
      $or: [{ post: { $in: postIds } }, { author: user._id }],
    });

    await Post.deleteMany({ author: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and all their posts and comments were deleted',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
