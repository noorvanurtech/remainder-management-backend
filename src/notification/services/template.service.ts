class TemplateService {
  getJobCreatedTemplate(jobData: any): string {
    // In a production scenario, you can use EJS, Handlebars, Pug, etc.
    // For now, returning a basic HTML structure.
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Booking Confirmation</h2>
        <p>Thank you for your booking!</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <p><strong>Booking ID:</strong> ${jobData._id}</p>
          <p><strong>Total Amount:</strong> ₹${jobData.totalAmount}</p>
          <p><strong>Status:</strong> ${jobData.jobStatus}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          If you have any questions, feel free to contact our support.
        </p>
      </div>
    `;
  }

  getJobAssignedTemplate(workshopName: string, jobId: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Job Assigned</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Glassforce</h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 16px; font-weight: 400;">New Job Assignment</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 18px; line-height: 1.5; color: #1e293b;">
                Hello <strong>${workshopName}</strong>,
              </p>
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                Great news! A new job has been successfully assigned to your workshop. Please review the details below to get started.
              </p>
              
              <!-- Job Details Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600;">Job Identifier</p>
                <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #0f172a; font-family: monospace;">${jobId}</p>
              </div>

              <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #475569;">
                Please log in to your dashboard to view the full details and manage the job. Thank you for partnering with <strong>Glassforce</strong>. Let's deliver excellence together.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                This is an automated notification. Please do not reply directly to this email.<br>
                &copy; ${new Date().getFullYear()} glassforce. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}

export default new TemplateService();
