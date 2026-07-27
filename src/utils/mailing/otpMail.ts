import resendStrategy from '../../notification/strategies/resend.strategy';

export const sendOtpEmail = async (email: string, fullName: string, otp: string, context: 'login' | 'forgot_password' = 'login') => {
    const currentYear = new Date().getFullYear();

    let title = '';
    let message = '';

    if (context === 'login') {
        title = 'glassforce - Login Verification';
        message = 'Please use the following One-Time Password (OTP) to complete your login process.';
    } else if (context === 'forgot_password') {
        title = 'glassforce - Password Reset';
        message = 'You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed.';
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; line-height: 1.6; color: #333333; }
            .otp-box { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #007bff; }
            .footer { text-align: center; font-size: 12px; color: #777777; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eeeeee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>${title}</h2>
            </div>
            <div class="content">
                <p>Hello <strong>${fullName}</strong>,</p>
                <p>${message}</p>
                
                <div class="otp-box">
                    ${otp}
                </div>

                <p>This OTP is valid for 10 minutes. Please do not share this OTP with anyone.</p>
            </div>
            <div class="footer">
                <p>&copy; ${currentYear} glassforce. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    console.log(`[Email Debug] Attempting to send OTP email to ${email} via Resend`);

    try {
        await resendStrategy.sendEmail({
            to: email,
            subject: title,
            html: htmlContent
        });
        console.log(`OTP email sent via Resend to ${email}`);
    } catch (error) {
        console.error('[Email Debug] Error sending OTP email via Resend:', error);
    }
};

