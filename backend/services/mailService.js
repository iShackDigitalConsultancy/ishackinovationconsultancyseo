require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Vera Sharp (Reporting Agent) Email Dispatcher
 */

const mailService = {
  sendDailyReport: async (subject, htmlBody) => {
    const user = process.env.VERA_EMAIL_USER || 'veras@ishack.co.za';
    const pass = process.env.VERA_EMAIL_PASS;

    if (!pass) {
      console.warn("VERA_EMAIL_PASS is missing. Vera Sharp will run in Simulation Mode.");
      console.log(`[SIMULATION EMAIL SEND] To: wayneb@ishack.co.za, richardb@ishack.co.za`);
      console.log(`[SIMULATION EMAIL SUBJECT] ${subject}`);
      return true;
    }

    try {
      // Assuming Google Workspace OAuth or App Passwords
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user,
          pass: pass
        }
      });

      const mailOptions = {
        from: `"Vera Sharp (SEO AI)" <${user}>`,
        to: ['wayneb@ishack.co.za', 'richardb@ishack.co.za'],
        subject: subject,
        html: htmlBody
      };

      await transporter.sendMail(mailOptions);
      console.log("Vera Sharp successfully dispatched daily status emails.");
      return true;
    } catch (error) {
      console.error("Vera Sharp failed to send email", error);
      return false;
    }
  },

  sendOutreachPitch: async (to, subject, htmlBody) => {
    const user = process.env.VERA_EMAIL_USER || 'veras@ishack.co.za';
    const pass = process.env.VERA_EMAIL_PASS;

    if (!pass) {
      console.log(`\n--- [SIMULATION OUTREACH DISPATCH] ---`);
      console.log(`TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`--------------------------------\n`);
      return true;
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });

      const mailOptions = {
        from: `"iShack SEO Partnerships" <${user}>`,
        to: to,
        subject: subject,
        html: htmlBody
      };

      await transporter.sendMail(mailOptions);
      console.log(`[SMTP] Successfully dispatched backlink pitch to ${to}`);
      return true;
    } catch (error) {
      console.error("[SMTP] Failed to dispatch outreach pitch", error);
      return false;
    }
  },

  sendPartnerInquiry: async (data) => {
    const user = process.env.VERA_EMAIL_USER || 'veras@ishack.co.za';
    const pass = process.env.VERA_EMAIL_PASS;
    const recipients = ['richardb@ishack.co.za', 'wayneb@ishack.co.za', 'veras@ishack.co.za'];

    const htmlBody = `
      <div style="font-family: sans-serif; background-color: #0A0D12; color: #FFF; padding: 20px; border-radius: 8px;">
        <h2 style="color: #06b6d4;">New B2B Partnership Inquiry</h2>
        <p>A new potential partner has submitted their details via the OpenClaw White-Label portal.</p>
        <hr style="border-color: #1e293b;" />
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;"><strong>Name:</strong> ${data.name || 'N/A'}</li>
          <li style="margin-bottom: 10px;"><strong>Company/Agency:</strong> ${data.company || 'N/A'}</li>
          <li style="margin-bottom: 10px;"><strong>Email:</strong> ${data.email || 'N/A'}</li>
          <li style="margin-bottom: 10px;"><strong>Active SEO Clients:</strong> ${data.size || 'N/A'}</li>
          <li style="margin-bottom: 10px;"><strong>Primary Goal:</strong> ${data.goal || 'N/A'}</li>
        </ul>
        <div style="background-color: #1e293b; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <h4 style="margin-top: 0; color: #94a3b8;">Additional Comments</h4>
          <p style="white-space: pre-wrap; font-style: italic;">${data.message || 'None provided.'}</p>
        </div>
      </div>
    `;

    if (!pass) {
      console.log(`\n--- [SIMULATION PARTNER INQUIRY DISPATCH] ---`);
      console.log(`TO: ${recipients.join(', ')}`);
      console.log(`BODY: ${htmlBody}`);
      console.log(`------------------------------------------\n`);
      return true;
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });

      const mailOptions = {
        from: `"iShack AI Portal" <${user}>`,
        to: recipients,
        subject: `[LEAD] New Partnership Inquiry from ${data.company || data.name}`,
        html: htmlBody
      };

      await transporter.sendMail(mailOptions);
      console.log(`[SMTP] Successfully dispatched partner inquiry logic.`);
      return true;
    } catch (error) {
      console.error("[SMTP] Failed to dispatch partner inquiry lead email", error);
      return false;
    }
  }
};

module.exports = mailService;
