import { Resend } from "resend";
import nodemailerStrategy from "./nodemailer.strategy";

class ResendStrategy {
  private resend: Resend | null = null;

  private getClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_123456789' || apiKey.startsWith('re_123456789')) {
      return null;
    }
    if (!this.resend) {
      this.resend = new Resend(apiKey);
    }
    return this.resend;
  }

  async sendEmail(options: { to: string | string[]; subject: string; text?: string; html: string; attachments?: any[] }) {
    const client = this.getClient();
    const toEmail = Array.isArray(options.to) ? options.to[0] : options.to;

    if (!client) {
      console.log("[ResendStrategy] RESEND_API_KEY is not configured or is placeholder. Using Nodemailer SMTP fallback...");
      return await nodemailerStrategy.sendEmail({
        to: toEmail,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });
    }

    try {
      const { data, error } = await client.emails.send({
        from: `"${process.env.FROM_NAME || 'Reminder Management'}" <${process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@glassforce.com'}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        text: options.text || "",
        html: options.html,
        attachments: options.attachments,
      });

      if (error) {
        console.error("Error sending email via Resend:", error);
        console.log("[ResendStrategy] Resend error encountered. Falling back to Nodemailer SMTP...");
        return await nodemailerStrategy.sendEmail({
          to: toEmail,
          subject: options.subject,
          text: options.text,
          html: options.html,
          attachments: options.attachments,
        });
      }

      console.log("Email sent via Resend: %s", data?.id);
      return { messageId: data?.id };
    } catch (error) {
      console.error("Error sending email via Resend:", error);
      console.log("[ResendStrategy] Exception caught. Falling back to Nodemailer SMTP...");
      return await nodemailerStrategy.sendEmail({
        to: toEmail,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });
    }
  }
}

export default new ResendStrategy();
