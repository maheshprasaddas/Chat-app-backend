import { SendMailClient } from 'zeptomail';
import logger from './logger.js';

/**
 * ZeptoMail SendMailClient configuration
 * Uses the Send Mail Token from .env to authenticate with ZeptoMail API
 */

const ZEPTO_MAIL_TOKEN = process.env.ZEPTO_MAIL_TOKEN;
const ZEPTO_API_URL = 'https://api.zeptomail.in/v1.1/email';

let mailClient = null;

try {
  if (!ZEPTO_MAIL_TOKEN || ZEPTO_MAIL_TOKEN === 'your_zepto_mail_send_mail_token_here') {
    logger.warn('ZEPTO_MAIL_TOKEN is not configured. Email sending will be disabled.');
  } else {
    mailClient = new SendMailClient({ url: ZEPTO_API_URL, token: ZEPTO_MAIL_TOKEN });
    logger.info('ZeptoMail client initialized successfully');
  }
} catch (error) {
  logger.error({ err: error }, 'Failed to initialize ZeptoMail client');
}

export { mailClient };
