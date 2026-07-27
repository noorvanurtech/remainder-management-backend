import mongoose from 'mongoose';
import User, { IUser } from '../models/user.model';
import { APIFeatures } from '../utils/apiFeatures';
import { MESSAGES } from '../constants/messages';

class UserService {
    async createUser(data: Partial<IUser>, session?: mongoose.ClientSession) {
        // Auto-generate credentials if missing
        let generatedPassword = '';
        if (!data.password) {
            generatedPassword = Math.random().toString(36).slice(-8).toUpperCase();
            data.password = generatedPassword;
        }

        if (!data.phone || String(data.phone).trim() === '') {
            delete data.phone;
        }

        const [user] = await User.create([{
            ...data
        }], { session });

        user.password = undefined;
        return { user, generatedPassword };
    }

    async getAllUsers(queryString: any) {
        const features = new APIFeatures(User.find(), queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        return await features.query;
    }

    async getAllUsersWithCount(queryString: any) {
        // Count Query (Filters only)
        const countFeatures = new APIFeatures(User.find(), queryString).filter();
        const total = await countFeatures.query.countDocuments();

        // Data Query (Filters, Sort, Pagination)
        const features = new APIFeatures(User.find(), queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const users = await features.query;
        return { users, total };
    }

    async findByEmail(email: string) {
        return await User.findOne({ email })
            .select('+password');
    }

    async findById(id: string) {
        return await User.findById(id);
    }

    async findByIdWithPassword(id: string) {
        return await User.findById(id).select('+password');
    }

    async updateUser(userId: string, updateData: Partial<IUser>) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(MESSAGES.USER.NOT_FOUND);
        }

        // Apply updates
        Object.assign(user, updateData);

        await user.save();
        return user;
    }

    async deleteUser(userId: string) {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error(MESSAGES.USER.NOT_FOUND);
        }
        return user;
    }
}

export default new UserService();
