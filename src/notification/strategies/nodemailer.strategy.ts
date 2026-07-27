import nodemailer from "nodemailer";

class NodemailerStrategy {
  private transporter;

  constructor() {
    const port = Number(process.env.SMTP_PORT) || 587;
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: { to: string; subject: string; text?: string; html: string; attachments?: any[] }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Glassforce'}" <${process.env.FROM_EMAIL || 'noreply@glassforce.com'}>`,
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
