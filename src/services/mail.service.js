import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Handlebars from 'handlebars';
import { mailClient } from '../config/mail.config.js';
import logger from '../config/logger.js';

// ─── Resolve template path ──────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatePath = join(__dirname, '..', 'templates', 'welcome.hbs');

// ─── Compile template once at startup ────────────────────────
let welcomeTemplate;
try {
  const templateSource = readFileSync(templatePath, 'utf-8');
  welcomeTemplate = Handlebars.compile(templateSource);
  logger.info('Welcome email template compiled successfully');
} catch (error) {
  logger.error({ err: error }, 'Failed to compile welcome email template');
}

/**
 * Send a welcome email with OTP to a newly registered user.
 *
 * This function is designed to be fire-and-forget:
 * - It never throws — errors are only logged.
 * - It silently skips if the mail client is not configured.
 *
 * @param {string} email  - Recipient email address
 * @param {string} [name] - User's display name (falls back to "there")
 * @param {string} otp    - The 6-digit OTP for account verification
 */
export const sendWelcomeMail = async (email, name, otp) => {
  try {
    // Guard: skip if mail client is not configured
    if (!mailClient) {
      logger.warn('Mail client not configured — skipping welcome email');
      return;
    }

    // Guard: skip if template failed to compile
    if (!welcomeTemplate) {
      logger.warn('Welcome template not available — skipping welcome email');
      return;
    }

    const userName = name || 'there';
    const currentYear = new Date().getFullYear();

    // Render the HTML body
    const htmlBody = welcomeTemplate({ userName, currentYear, otp });

    // Send via ZeptoMail
    const response = await mailClient.sendMail({
      from: {
        address: process.env.ZEPTO_MAIL_FROM_EMAIL,
        name: process.env.ZEPTO_MAIL_FROM_NAME || 'KhatiUp',
      },
      to: [
        {
          email_address: {
            address: email,
            name: userName,
          },
        },
      ],
      subject: `${otp} is your verification code`,
      htmlbody: htmlBody,
    });

    logger.info({ email, messageId: response?.data?.message }, 'Welcome email sent successfully');
  } catch (error) {
    // Log but never throw — email failure must not break registration
    logger.error({ err: error, email }, 'Failed to send welcome email');
  }
};

