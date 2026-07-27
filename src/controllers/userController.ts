import { Request, Response, NextFunction } from "express";
import userService from "../services/userService";

import User, { IUser } from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { MESSAGES, STATUS as MSG_STATUS } from "../constants/messages";
import { sendWelcomeEmail } from "../utils/mailing/welcomeMail";

import { getPaginationData } from "../utils/pagination";
import { ROLES, ALL_ROLES, STATUS } from "../constants/index";

import { getDuplicateErrorMessage } from "../utils/errorHelpers";

export const createUser = async (
  req: AuthRequest, // Changed to AuthRequest to access req.user
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let { name, email, role, password, phone, workshopId } = req.body;

    // 1. Role Validation - Ensure role exists
    if (!role || !ALL_ROLES.includes(role)) {
      res.status(400).json({
        status: MSG_STATUS.FAIL,
        message: MESSAGES.VALIDATION.INVALID_ROLE(ALL_ROLES),
      });
      return;
    }



    // 3. Workshop Validation - Ensure workshopId is provided for non-admin roles
    if (!workshopId && role !== ROLES.SUPER_ADMIN && role !== ROLES.ADMIN) {
      res.status(400).json({
        status: MSG_STATUS.FAIL,
        message: "Workshop Id is required for this role.",
      });
      return;
    }

    const { user: newUser, generatedPassword } = await userService.createUser({
      name,
      email,
      password,
      role,
      phone,
      workshopId,
    } as any);

    const finalPassword = generatedPassword || password;

    // Send Welcome Email
    await sendWelcomeEmail(newUser.email, newUser.name, finalPassword);

    res.status(201).json({
      status: MSG_STATUS.SUCCESS,
      message: MESSAGES.USER.CREATED,
      data: newUser,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      const message = getDuplicateErrorMessage(err);
      res.status(400).json({
        status: MSG_STATUS.FAIL,
        message,
      });
      return;
    }
    res
      .status(500)
      .json({ status: MSG_STATUS.FAIL, message: (err as Error).message });
  }
};

export const createSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password, secretKey, phone, role } = req.body;

    console.log("secretKey", secretKey);

    // Simple security check
    if (!secretKey || !process.env.SUPER_ADMIN_SECRET || secretKey !== process.env.SUPER_ADMIN_SECRET) {
      res.status(403).json({
        status: MSG_STATUS.FAIL,
        message: MESSAGES.VALIDATION.INVALID_SECRET_KEY,
      });
      return;
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      res
        .status(400)
        .json({ status: MSG_STATUS.FAIL, message: MESSAGES.USER.EMAIL_EXISTS });
      return;
    }

    const newUser = await User.create({
      name,
      email,
      password, // Hashed by hook
      role: ROLES.SUPER_ADMIN,
      status: STATUS.ACTIVE,
      phone: phone || "0000000000",
    });

    const userResponse = newUser.toObject();

    res.status(201).json({
      status: MSG_STATUS.SUCCESS,
      message: MESSAGES.USER.SUPER_ADMIN_CREATED,
      data: userResponse,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ status: MSG_STATUS.FAIL, message: (err as Error).message });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    req.query.page = String(page);
    req.query.limit = String(limit);

    const { users, total } = await userService.getAllUsersWithCount(req.query);

    const metaInfo = getPaginationData(total, page, limit);

    res.status(200).json({
      status: MSG_STATUS.SUCCESS,
      data: users,
      metaInfo,
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: MSG_STATUS.FAIL, message: (err as Error).message });
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id as any);

    if (!user) {
      res
        .status(404)
        .json({ status: MSG_STATUS.FAIL, message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    res.status(200).json({
      status: MSG_STATUS.SUCCESS,
      data: user,
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: MSG_STATUS.FAIL, message: (err as Error).message });
  }
};

export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = stats.reduce(
      (acc, curr) => {
        acc[curr._id === STATUS.ACTIVE ? "active" : "inactive"] = curr.count;
        return acc;
      },
      { active: 0, inactive: 0 } as Record<string, number>,
    );

    const totalUsers = formattedStats.active + formattedStats.inactive;

    res.status(200).json({
      status: MSG_STATUS.SUCCESS,
      data: {
        ...formattedStats,
        totalUsers,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: MSG_STATUS.FAIL, message: (err as Error).message });
  }
};

export const getUserActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Set defaults if not provided
    if (!req.query.sort) {
      req.query.sort = "-lastLogin"; // Default: Latest login first
    }
    if (!req.query.limit) {
      req.query.limit = "10"; // Default: 10 items per page
    }
    if (!req.query.page) {
      req.query.page = "1";
    }

    const { users, total } = await userService.getAllUsersWithCount(req.query);

    const page = parseInt(req.query.page as string, 10);
    const limit = parseInt(req.query.limit as string, 10);
    const metaInfo = getPaginationData(total, page, limit);

    res.status(200).json({
      status: MSG_STATUS.SUCCESS,
      data: users,
      metaInfo,
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: MSG_STATUS.FAIL, message: (err as Error).message });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating immutable fields or security sensitive fields directly if needed
    delete updateData.password;
    delete updateData.email;

    if (updateData.role && !ALL_ROLES.includes(updateData.role)) {
      res.status(400).json({
        status: MSG_STATUS.FAIL,
        message: MESSAGES.VALIDATION.INVALID_ROLE(ALL_ROLES),
      });
      return;
    }

    const user = await userService.updateUser(id as any, updateData);

    // // Log Audit
    // await auditService.logAction(
    //     AuditAction.UPDATE_USER,
    //     (req as any).user._id,
    //     id as any,
    //     'User',
    //     updateData,
    //     AuditStatus.INFO
    // );

    res.status(200).json({
      status: MSG_STATUS.SUCCESS,
      message: MESSAGES.USER.UPDATED,
      data: { user },
    });
  } catch (err) {
    res
      .status(400)
      .json({ status: MSG_STATUS.FAIL, message: (err as Error).message });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Prevent updating immutable fields or security sensitive fields directly
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.status;

    const user = await userService.updateUser(userId as any, updateData);

    res.status(200).json({
      status: MSG_STATUS.SUCCESS,
      message: MESSAGES.USER.UPDATED,
      data: user,
    });
  } catch (err) {
    res
      .status(400)
      .json({ status: MSG_STATUS.FAIL, message: (err as Error).message });
  }
};


export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ status: MSG_STATUS.FAIL, message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    res.status(200).json({
      status: MSG_STATUS.SUCCESS,
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({ status: MSG_STATUS.FAIL, message: (err as Error).message });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id as any);

    res.status(200).json({
      status: MSG_STATUS.SUCCESS,
      message: MESSAGES.USER.DELETED || "User deleted successfully",
    });
  } catch (err) {
    res
      .status(400)
      .json({ status: MSG_STATUS.FAIL, message: (err as Error).message });
  }
};
