const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('bio')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Bio cannot exceed 200 characters'),
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage("Role must be 'user' or 'admin'"),
  ],
  validate,
  registerUser
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginUser
);

router.get('/', getUsers);
router.get('/:id', getUserById);

router.put(
  '/:id',
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('bio')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Bio cannot exceed 200 characters'),
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage("Role must be 'user' or 'admin'"),
  ],
  validate,
  updateUser
);

router.delete('/:id', deleteUser);

module.exports = router;
