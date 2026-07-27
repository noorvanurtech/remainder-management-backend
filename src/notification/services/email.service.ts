import resendStrategy from "../strategies/resend.strategy";
import templateService from "./template.service";

class EmailService {
  async sendJobCreatedEmail(to: string, jobData: any) {
    const htmlContent = templateService.getJobCreatedTemplate(jobData);

    await resendStrategy.sendEmail({
      to,
      subject: `Booking Confirmation - ${jobData._id}`,
      html: htmlContent,
    });
  }

  async sendJobAssignedEmail(to: string, workshopName: string, jobId: string) {
    const htmlContent = templateService.getJobAssignedTemplate(workshopName, jobId);

    await resendStrategy.sendEmail({
      to,
      subject: `New Job Assigned - ${jobId}`,
      html: htmlContent,
    });
  }
}

export default new EmailService();
