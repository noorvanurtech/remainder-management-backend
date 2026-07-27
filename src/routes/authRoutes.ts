import express from 'express';
import { login, adminLogin, changePassword, verifyOtp, logout, forgotPasswordOtp, resetPassword, register, googleLogin } from '../controllers/authController';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, googleLoginSchema } from '../validations/auth.validation';

const router = express.Router();




// create these two api and integrate in the frontend after that userRoute
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);




// 
router.post('/google-login', validate(googleLoginSchema), googleLogin);
router.post('/adminlogin', validate(loginSchema), adminLogin);
router.post('/verify-otp', verifyOtp);
router.get('/logout', protect, logout);
router.patch('/change-password', protect, changePassword);

router.post('/forgot-password-otp', forgotPasswordOtp);
router.post('/forgot-password', protect, resetPassword);

export default router;
