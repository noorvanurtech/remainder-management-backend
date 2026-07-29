import Category, { ICategory } from '../models/category.model';
import Reminder from '../models/reminder.model';

class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(userId: string, data: any): Promise<ICategory> {
    const existing = await Category.findOne({ user: userId, name: data.name.trim() });
    if (existing) {
      return existing;
    }
    const category = await Category.create({ ...data, user: userId });
    return category;
  }

  /**
   * Get all categories for a user with reminder count
   */
  async getAllCategories(userId: string, search?: string): Promise<any[]> {
    const query: any = { user: userId };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(query).sort({ createdAt: -1 });

    // Calculate total reminders count for each category
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const categoryObj = category.toObject();
        const count = await Reminder.countDocuments({
          user: userId,
          category: category.name,
        });
        return {
          ...categoryObj,
          count,
        };
      })
    );

    return categoriesWithStats;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(userId: string, categoryId: string): Promise<any> {
    const category = await Category.findOne({ _id: categoryId, user: userId });
    if (!category) {
      throw new Error('Category not found');
    }
    const count = await Reminder.countDocuments({
      user: userId,
      category: category.name,
    });

    return {
      ...category.toObject(),
      count,
    };
  }

  /**
   * Update category
   */
  async updateCategory(userId: string, categoryId: string, data: any): Promise<ICategory> {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, user: userId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!category) {
      throw new Error('Category not found or unauthorized');
    }
    return category;
  }

  /**
   * Delete category
   */
  async deleteCategory(userId: string, categoryId: string): Promise<boolean> {
    const result = await Category.deleteOne({ _id: categoryId, user: userId });
    if (result.deletedCount === 0) {
      throw new Error('Category not found or unauthorized');
    }
    return true;
  }
}

export default new CategoryService();
