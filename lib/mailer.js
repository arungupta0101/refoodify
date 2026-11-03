import nodemailer from 'nodemailer';

// Create a reusable transporter instance
export function getMailTransporter() {
  const host = (process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.EMAIL_SERVER_PORT) || 465;
  const user = (process.env.EMAIL_SERVER_USER || '').trim();
  const pass = (process.env.EMAIL_SERVER_PASSWORD || '').trim();

  if (!user || !pass) {
    throw new Error(
      'Email credentials (EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD) are not set in .env.local.'
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 or other ports
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Send an OTP email for password reset
 * @param {string} toEmail 
 * @param {string} otp 
 */
export async function sendOtpEmail(toEmail, otp) {
  const transporter = getMailTransporter();
  const from = process.env.EMAIL_FROM || `"Refoodify Support" <${process.env.EMAIL_SERVER_USER}>`;

  const mailOptions = {
    from,
    to: toEmail,
    subject: 'Your Password Reset OTP - Refoodify',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .logo { font-size: 24px; font-weight: 800; color: #10b981; margin-bottom: 20px; display: inline-block; }
            .heading { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
            .text { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
            .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: monospace; }
            .meta { font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            .warning { color: #dc2626; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🌿 Refoodify</div>
            <div class="heading">Password Reset Verification</div>
            <p class="text">
              We received a request to reset your password. Use the verification code below to complete the process.
            </p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="text">
              This code will expire in <span class="warning">10 minutes</span>.
            </p>
            <div class="meta">
              If you didn't request a password reset, you can safely ignore this email or reach out to support if you have concerns. Never share this code with anyone.
            </div>
          </div>
        </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

