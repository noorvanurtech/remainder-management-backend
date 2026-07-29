import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validations/category.validation';

const router = express.Router();

// All category routes require authentication
router.use(protect);

router
  .route('/')
  .post(validate(createCategorySchema), createCategory)
  .get(getAllCategories);

router
  .route('/:id')
  .get(getCategoryById)
  .patch(validate(updateCategorySchema), updateCategory)
  .delete(deleteCategory);

export default router;
