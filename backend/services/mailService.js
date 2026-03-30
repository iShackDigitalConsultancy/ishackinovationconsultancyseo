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
      console.warn("VERA_EMAIL_PASS is missing. Vera Sharp will run in Mock Mode.");
      console.log(`[MOCK EMAIL SEND] To: wayneb@ishack.co.za, richardb@ishack.co.za`);
      console.log(`[MOCK EMAIL SUBJECT] ${subject}`);
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
      console.log(`\n--- [MOCK OUTREACH DISPATCH] ---`);
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
  }
};

module.exports = mailService;
