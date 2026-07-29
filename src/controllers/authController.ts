import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { MESSAGES, STATUS } from '../constants/messages';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { fullName, name, email, password, phone } = req.body;
        const userName = fullName || name;
        const result = await authService.register({ name: userName, email, password, phone });

        res.status(201).json({
            status: STATUS.SUCCESS,
            message: result.message,
            token: result.token,
            data: result.user
        });
    } catch (err) {
        res.status(500).json({ status: STATUS.FAIL, message: (err as Error).message });
    }
};

export const adminRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { fullName, name, email, password, phone } = req.body;
        const userName = fullName || name;
        const result = await authService.adminRegister({ name: userName, email, password, phone });

        res.status(201).json({
            status: STATUS.SUCCESS,
            message: result.message,
            token: result.token,
            data: result.user
        });
    } catch (err) {
        res.status(500).json({ status: STATUS.FAIL, message: (err as Error).message });
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.status(200).json({
            status: STATUS.SUCCESS,
            message: result.message,
            token: result.token,
            data: result.user
        });
    } catch (err) {
        res.status(500).json({ status: STATUS.FAIL, message: (err as Error).message });
    }
};
export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { idToken, role } = req.body;
        const result = await authService.googleLogin(idToken, role);

        res.status(200).json({
            status: STATUS.SUCCESS,
            message: result.message,
            token: result.token,
            data: result.user
        });
    } catch (err) {
        res.status(500).json({ status: STATUS.FAIL, message: (err as Error).message });
    }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        const result = await authService.adminLogin(email, password);

        res.status(200).json({
            status: STATUS.SUCCESS,
            message: result.message,
            token: result.token,
            data: result.user
        });
    } catch (err) {
        res.status(500).json({ status: STATUS.FAIL, message: (err as Error).message });
    }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyOtp(email, otp);

        res.status(200).json({
            status: STATUS.SUCCESS,
            token: result.token,
            message: MESSAGES.AUTH.OTP_VERIFIED,
            data: result.user

        });
    } catch (err) {
        res.status(500).json({ status: STATUS.FAIL, message: (err as Error).message });
    }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { currentPassword, newPassword } = req.body;

        const result = await authService.changePassword(userId, currentPassword, newPassword);

        res.status(200).json({
            status: STATUS.SUCCESS,
            token: result.token,
            message: MESSAGES.AUTH.PASSWORD_CHANGED
        });

    } catch (err) {
        res.status(500).json({ status: STATUS.FAIL, message: (err as Error).message });
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(400).json({ status: STATUS.FAIL, message: MESSAGES.AUTH.TOKEN_NOT_PROVIDED });
            return;
        }

        await authService.logout(userId, token);

        res.status(200).json({
            status: STATUS.SUCCESS,
            message: MESSAGES.AUTH.LOGOUT_SUCCESS
        });

    } catch (err) {
        res.status(500).json({ status: STATUS.FAIL, message: (err as Error).message });
    }
};

export const forgotPasswordOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPasswordOtp(email);

        res.status(200).json({
            status: STATUS.SUCCESS,
            message: result.message
        });
    } catch (err) {
        res.status(500).json({ status: STATUS.FAIL, message: (err as Error).message });
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        const result = await authService.resetPassword(email, password);

        res.status(200).json({
            status: STATUS.SUCCESS,
            message: result.message
        });
    } catch (err) {
        res.status(500).json({ status: STATUS.FAIL, message: (err as Error).message });
    }
};

