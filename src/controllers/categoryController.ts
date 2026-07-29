import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import categoryService from '../services/categoryService';
import { STATUS } from '../constants/messages';

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const category = await categoryService.createCategory(userId, req.body);

    res.status(201).json({
      status: STATUS.SUCCESS,
      message: 'Category created successfully',
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const getAllCategories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const search = req.query.search as string | undefined;
    const categories = await categoryService.getAllCategories(userId, search);

    res.status(200).json({
      status: STATUS.SUCCESS,
      results: categories.length,
      data: categories,
    });
  } catch (err) {
    res.status(500).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const getCategoryById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const categoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const category = await categoryService.getCategoryById(userId, categoryId);

    res.status(200).json({
      status: STATUS.SUCCESS,
      data: category,
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const categoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const category = await categoryService.updateCategory(userId, categoryId, req.body);

    res.status(200).json({
      status: STATUS.SUCCESS,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (err) {
    res.status(400).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const categoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await categoryService.deleteCategory(userId, categoryId);

    res.status(200).json({
      status: STATUS.SUCCESS,
      message: 'Category deleted successfully',
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};
