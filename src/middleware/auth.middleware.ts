import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { MESSAGES } from '../constants/messages';
import { ROLES, STATUS } from '../constants';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Protect routes: Verify JWT and attach user to request
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: STATUS.FAIL,
      message: MESSAGES.AUTH.TOKEN_NOT_PROVIDED,
    });
  }

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_dev_key',
    );

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: STATUS.FAIL,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    if (currentUser.status !== STATUS.ACTIVE) {
      return res.status(401).json({
        status: STATUS.FAIL,
        message: MESSAGES.AUTH.ACCOUNT_DEACTIVATED,
      });
    }

    req.user = currentUser;
    next();
  } catch (error: any) {
    // Handle token expiration error
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: STATUS.FAIL,
        message: MESSAGES.AUTH.TOKEN_EXPIRED,
        expiredAt: error.expiredAt,
      });
    }

    return res.status(401).json({
      status: STATUS.FAIL,
      message: MESSAGES.AUTH.TOKEN_INVALID,
    });
  }
};

/**
 * Optional Auth: Verify JWT and attach user if present, otherwise proceed
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_dev_key',
    );

    const currentUser = await User.findById(decoded.id);

    if (currentUser && currentUser.status === STATUS.ACTIVE) {
      req.user = currentUser;
    }
    
    next();
  } catch (error: any) {
    // If token is invalid or expired, proceed without a user
    next();
  }
};

/**
 * Restrict routes based on role
 * Supports both single role and multiple roles
 */
export const restrictTo = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: STATUS.FAIL,
        message: MESSAGES.AUTH.UNAUTHORIZED,
      });
    }

    const userRole = user.role;

    // Super Admin Bypass
    if (userRole === ROLES.SUPER_ADMIN) {
      return next();
    }

    // Check if user's role is in the allowed list
    const hasAccess = allowedRoles.includes(userRole);

    if (!hasAccess) {
      // Format roles message for the error response
      let rolesMessage = allowedRoles.join(', ');
      if (allowedRoles.length > 2) {
        const lastCommaIndex = rolesMessage.lastIndexOf(',');
        rolesMessage =
          rolesMessage.slice(0, lastCommaIndex) +
          ' and' +
          rolesMessage.slice(lastCommaIndex + 1);
      } else if (allowedRoles.length === 2) {
        rolesMessage = allowedRoles.join(' and ');
      }

      return res.status(403).json({
        status: STATUS.FAIL,
        message: MESSAGES.AUTH.ACCESS_DENIED(rolesMessage),
      });
    }

    next();
  };
};

/**
 * Alias for restrictTo to maintain compatibility with older code
 */
export const authorize = restrictTo;
