import express from 'express';
import { login, adminLogin, changePassword, verifyOtp, logout, forgotPasswordOtp, resetPassword, register, adminRegister, googleLogin } from '../controllers/authController';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { registerSchema, adminRegisterSchema, loginSchema, googleLoginSchema } from '../validations/auth.validation';

const router = express.Router();

// Registration & Login Endpoints
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Admin Registration & Login Endpoints
router.post('/admin-register', validate(adminRegisterSchema), adminRegister);
router.post('/adminregister', validate(adminRegisterSchema), adminRegister);
router.post('/admin-login', validate(loginSchema), adminLogin);
router.post('/adminlogin', validate(loginSchema), adminLogin);

// 
router.post('/google-login', validate(googleLoginSchema), googleLogin);
router.post('/verify-otp', verifyOtp);
router.get('/logout', protect, logout);
router.patch('/change-password', protect, changePassword);

router.post('/forgot-password-otp', forgotPasswordOtp);
router.post('/forgot-password', resetPassword);

export default router;
