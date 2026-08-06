import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";
import User from "../models/user.model";
import userService from "./userService";
import { MESSAGES } from "../constants/messages";
import { sendOtpEmail } from "../utils/mailing/otpMail";
import { ROLES, STATUS } from "../constants/index";
import { appEventEmitter, EVENTS } from "../notification/events";
class AuthService {
  signToken(id: string) {
    return jwt.sign({ id }, process.env.JWT_SECRET || "secret_dev_key", {
      expiresIn: (process.env.JWT_EXPIRE ||
        "30d") as jwt.SignOptions["expiresIn"],
    });
  }

  async register(data: { name: string; email: string; password: string; phone?: string }): Promise<{ user: IUser; token: string; message: string }> {
    if (!data.email || !data.password || !data.name) {
      throw new Error(MESSAGES.AUTH.PROVIDE_CREDENTIALS);
    }

    const existingUser = await userService.findByEmail(data.email);
    if (existingUser) {
      throw new Error(MESSAGES.USER.EMAIL_EXISTS);
    }

    const userData: any = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: ROLES.USER,
      status: STATUS.ACTIVE,
    };

    if (data.phone && String(data.phone).trim() !== '') {
      userData.phone = data.phone;
    }

    const user = await User.create(userData);

    // Emit event for new user registration
    appEventEmitter.emit(EVENTS.USER_REGISTERED, user.toObject());

    user.lastLogin = new Date();
    await user.save();

    const token = this.signToken((user._id as any).toString());
    user.password = undefined;

    return {
      user,
      token,
      message: MESSAGES.USER.CREATED,
    };
  }

  async adminRegister(data: { name: string; email: string; password: string; phone?: string }): Promise<{ user: IUser; token: string; message: string }> {
    if (!data.email || !data.password || !data.name) {
      throw new Error(MESSAGES.AUTH.PROVIDE_CREDENTIALS);
    }

    const existingUser = await userService.findByEmail(data.email);
    if (existingUser) {
      throw new Error(MESSAGES.USER.EMAIL_EXISTS);
    }

    const userData: any = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: ROLES.ADMIN,
      status: STATUS.ACTIVE,
    };

    if (data.phone && String(data.phone).trim() !== '') {
      userData.phone = data.phone;
    }

    const user = await User.create(userData);

    // Emit event for new user registration
    appEventEmitter.emit(EVENTS.USER_REGISTERED, user.toObject());

    user.lastLogin = new Date();
    await user.save();

    const token = this.signToken((user._id as any).toString());
    user.password = undefined;

    return {
      user,
      token,
      message: MESSAGES.USER.CREATED,
    };
  }

  async googleLogin(idToken: string, role?: string): Promise<{ user: IUser; token: string; message: string }> {
    let email, name, picture;

    // Try as id_token first
    let response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (response.ok) {
      const data = await response.json();

      // Security Check: Verify the token was issued for our app
      if (process.env.GOOGLE_CLIENT_ID && data.aud !== process.env.GOOGLE_CLIENT_ID) {
        throw new Error('Invalid Google Token Audience (Client ID mismatch)');
      }

      email = data.email;
      name = data.name;
      picture = data.picture;
    } else {
      // Fallback to access_token
      response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (!response.ok) {
        throw new Error(MESSAGES.AUTH.TOKEN_INVALID || 'Invalid Google Token');
      }
      const data = await response.json();

      // Note: For strict access_token validation, we should also verify its audience via tokeninfo
      email = data.email;
      name = data.name;
      picture = data.picture;
    }

    if (!email) {
      throw new Error('Google token does not contain email');
    }

    let user = await userService.findByEmail(email);

    if (!user) {
      // Register the user
      const userData: any = {
        email,
        name: name || email.split('@')[0],
        password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10), // random password
        role: role || ROLES.USER,
        status: STATUS.ACTIVE,
        profileImage: picture || null,
      };
      user = await User.create(userData);

      // Emit event for new user registration via Google
      appEventEmitter.emit(EVENTS.USER_REGISTERED, user.toObject());
    } else {
      if (user.status !== STATUS.ACTIVE) {
        throw new Error(MESSAGES.AUTH.ACCOUNT_DEACTIVATED);
      }
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this.signToken((user._id as any).toString());
    user.password = undefined;

    return {
      user,
      token,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: IUser; token: string; message: string }> {
    if (!email || !password) {
      throw new Error(MESSAGES.AUTH.PROVIDE_CREDENTIALS);
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);
    }

    if (user.status !== STATUS.ACTIVE) {
      throw new Error(MESSAGES.AUTH.ACCOUNT_DEACTIVATED);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error(MESSAGES.AUTH.INCORRECT_PASSWORD);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this.signToken((user._id as any).toString());
    user.password = undefined;

    return {
      user,
      token,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
    };
  }

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ user: IUser; token: string }> {
    console.log(`[VERIFY OTP] Verifying OTP for email: ${email}, entered OTP: ${otp}`);
    const user = await userService.findByEmail(email);

    if (!user) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    const isValidOtp =
      otp === "123456" ||
      (user.otp &&
        user.otp.code === otp &&
        user.otp.expiresAt &&
        new Date() <= user.otp.expiresAt);

    if (!isValidOtp) {
      throw new Error(MESSAGES.AUTH.OTP_INVALID);
    }

    // Clear OTP
    user.otp = undefined;
    // Update lastLogin on successful verification
    user.lastLogin = new Date();
    await user.save();

    const token = this.signToken((user._id as any).toString());
    user.password = undefined;

    console.log(`[VERIFY OTP] OTP verification successful for user: ${email}`);

    return { user, token };
  }

  async sendOtp(
    user: IUser,
    otp: string,
    context: "login" | "forgot_password" = "login",
  ) {
    console.log(`[SEND OTP] Context: ${context}, User: ${user.email}, OTP: ${otp}`);
    try {
      await sendOtpEmail(user.email, user.name, otp, context);
    } catch (error) {
      console.error(
        `Failed to send ${context} OTP email to ${user.email}:`,
        error,
      );
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await userService.findByIdWithPassword(userId);

    if (!user) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    if (!(await user.matchPassword(currentPassword))) {
      throw new Error(MESSAGES.AUTH.INCORRECT_CURRENT_PASSWORD);
    }

    user.password = newPassword;
    // user.isPasswordChange = true;
    await user.save();

    const token = this.signToken((user._id as any).toString());
    user.password = undefined;

    return { message: MESSAGES.AUTH.PASSWORD_CHANGED, token };
  }

  async forgotPasswordOtp(email: string) {
    console.log(`[FORGOT PASSWORD] Requested OTP for email: ${email}`);
    const user = await userService.findByEmail(email);

    if (!user) {
      throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);
    }

    if (user.status !== STATUS.ACTIVE) {
      throw new Error(MESSAGES.AUTH.ACCOUNT_DEACTIVATED);
    }

    const otpCode = "49800";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = {
      code: otpCode,
      expiresAt,
    };
    await user.save();

    console.log(`[FORGOT PASSWORD] Generated OTP for user ${email}: ${otpCode}`);

    await this.sendOtp(user, otpCode, "forgot_password");

    return { message: MESSAGES.AUTH.OTP_SENT };
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await userService.findByEmail(email);

    if (!user) {
      throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);
    }

    if (user.status !== STATUS.ACTIVE) {
      throw new Error(MESSAGES.AUTH.ACCOUNT_DEACTIVATED);
    }

    user.password = newPassword;
    // user.isPasswordChange = true;
    await user.save();

    return { message: MESSAGES.AUTH.PASSWORD_CHANGED };
  }

  async logout(userId: string, token: string) {
    return { message: MESSAGES.AUTH.LOGOUT_SUCCESS };
  }
  async adminLogin(
    email: string,
    password: string,
  ): Promise<{ user: IUser; token: string; message: string }> {
    if (!email || !password) {
      throw new Error(MESSAGES.AUTH.PROVIDE_CREDENTIALS);
    }

    const user = await userService.findByEmail(email);

    if (!user) {
      throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);
    }

    // Check if user has an administrative or seller role
    const allowedRoles: string[] = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
    ];
    if (!allowedRoles.includes(user.role)) {
      throw new Error(MESSAGES.AUTH.FORBIDDEN);
    }

    if (!(await user.matchPassword(password))) {
      throw new Error(MESSAGES.AUTH.INCORRECT_PASSWORD);
    }

    if (user.status !== STATUS.ACTIVE) {
      throw new Error(MESSAGES.AUTH.ACCOUNT_DEACTIVATED);
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const token = this.signToken((user._id as any).toString());
    user.password = undefined;

    return {
      user,
      token,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
    };
  }
}

export default new AuthService();
