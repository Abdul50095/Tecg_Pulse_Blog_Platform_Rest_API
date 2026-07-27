const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');

const router = express.Router();

router.post(
  '/',
  [
    body('text')
      .trim()
      .isLength({ min: 2, max: 500 })
      .withMessage('Comment must be between 2 and 500 characters'),
    body('author').isMongoId().withMessage('A valid author (user ID) is required'),
    body('post').isMongoId().withMessage('A valid post ID is required'),
  ],
  validate,
  createComment
);

router.get('/post/:postId', getCommentsByPost);

router.put(
  '/:id',
  [
    body('text')
      .trim()
      .isLength({ min: 2, max: 500 })
      .withMessage('Comment must be between 2 and 500 characters'),
  ],
  validate,
  updateComment
);

router.delete('/:id', deleteComment);

module.exports = router;
