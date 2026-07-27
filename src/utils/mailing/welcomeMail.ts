import { transporter } from '../../config/email';

export const sendWelcomeEmail = async (email: string, fullName: string, password: string) => {
    // Default frontend URL if env not set
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000/login';

    const currentYear = new Date().getFullYear();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Welcome to glassforce</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; line-height: 1.6; color: #333333; }
            .credentials { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; font-size: 12px; color: #777777; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eeeeee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to glassforce!</h1>
            </div>
            <div class="content">
                <p>Hello <strong>${fullName}</strong>,</p>
                <p>Your account has been successfully created by the administrator. You can now access the glassforce panel using the credentials below.</p>
                
                <div class="credentials">
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Temporary Password:</strong> ${password}</p>
                </div>

                <p>Please login and change your password immediately for security purposes.</p>

                <div style="text-align: center;">
                    <a href="${frontendUrl}" class="button">Login to CRM Panel</a>
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${currentYear} glassforce. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"glassforce" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Welcome to glassforce - Your Login Credentials',
        html: htmlContent
    };

    console.log(`[Email Debug] Attempting to send welcome email to ${email}`);
    console.log(`[Email Debug] SMTP Config - Host: ${process.env.EMAIL_HOST}, Port: ${process.env.EMAIL_PORT}, User: ${process.env.EMAIL_USER ? '***' : 'Missing'}`);

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error('[Email Debug] Error sending welcome email:', error);
        // We don't throw here to avoid breaking the user creation flow if email fails
    }
};

