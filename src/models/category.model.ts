import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '#3f51b5',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

CategorySchema.index({ user: 1, name: 1 }, { unique: true });

const Category = mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
