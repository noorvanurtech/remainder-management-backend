import { Resend } from "resend";

class ResendStrategy {
  private resend: Resend | null = null;

  private getClient(): Resend {
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY || 're_123456789';
      this.resend = new Resend(apiKey);
    }
    return this.resend;
  }

  async sendEmail(options: { to: string | string[]; subject: string; text?: string; html: string; attachments?: any[] }) {
    try {
      const client = this.getClient();
      const { data, error } = await client.emails.send({
        from: `"${process.env.FROM_NAME || 'Glassforce'}" <${process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@glassforce.com'}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        text: options.text || "",
        html: options.html,
        attachments: options.attachments,
      });

      if (error) {
        console.error("Error sending email via Resend:", error);
        throw error;
      }

      console.log("Email sent: %s", data?.id);
      return { messageId: data?.id };
    } catch (error) {
      console.error("Error sending email via Resend:", error);
      throw error;
    }
  }
}

export default new ResendStrategy();
