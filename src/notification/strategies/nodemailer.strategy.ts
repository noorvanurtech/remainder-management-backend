import nodemailer from "nodemailer";

class NodemailerStrategy {
  private transporter;

  constructor() {
    const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
    const smtpPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/^['"]|['"]$/g, '');
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com",
      port: port,
      secure: port === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendEmail(options: { to: string; subject: string; text?: string; html: string; attachments?: any[] }) {
    try {
      const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
      const fromName = process.env.FROM_NAME || 'Reminder Management';

      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });
      console.log("Email sent: %s", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email via Nodemailer:", error);
      throw error;
    }
  }
}

export default new NodemailerStrategy();
