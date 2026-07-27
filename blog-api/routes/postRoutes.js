const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
  createPost,
  getPublishedPosts,
  getAllPosts,
  getPostById,
  updatePost,
  likePost,
  togglePublish,
  deletePost,
} = require('../controllers/postController');

const router = express.Router();

const CATEGORIES = ['Tech', 'Lifestyle', 'Education', 'Business', 'Other'];

router.post(
  '/',
  [
    body('title')
      .trim()
      .isLength({ min: 5, max: 150 })
      .withMessage('Title must be between 5 and 150 characters'),
    body('content')
      .trim()
      .isLength({ min: 20 })
      .withMessage('Content must be at least 20 characters'),
    body('category')
      .isIn(CATEGORIES)
      .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    body('tags')
      .optional()
      .isArray({ max: 5 })
      .withMessage('A post can have a maximum of 5 tags'),
    body('author').isMongoId().withMessage('A valid author (user ID) is required'),
  ],
  validate,
  createPost
);

// IMPORTANT: '/all' is registered before '/:id' — otherwise Express would
// treat "all" as an :id value and this route would never be reached.
router.get('/all', getAllPosts);
router.get('/', getPublishedPosts);
router.get('/:id', getPostById);

router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 5, max: 150 }),
    body('content').optional().trim().isLength({ min: 20 }),
    body('category').optional().isIn(CATEGORIES),
    body('tags').optional().isArray({ max: 5 }),
    body('isPublished').optional().isBoolean(),
  ],
  validate,
  updatePost
);

router.patch('/:id/like', likePost);
router.patch('/:id/publish', togglePublish);
router.delete('/:id', deletePost);

module.exports = router;
