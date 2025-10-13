import colors from 'colors';
import nodemailer from 'nodemailer';
import { config } from '../../config';
import { errorLogger, logger } from '../../shared/logger';
import { ISendEmail } from '../../types/email';

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: Number(config.smtp.port),
  secure: false,
  auth: {
    user: config.smtp.username,
    pass: config.smtp.password,
  },
});

// Verify transporter connection
if (config.environment !== 'test') {
  transporter
    .verify()
    .then(() => logger.info(colors.cyan('📧  Connected to email server')))
    .catch((err: Error) =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

// Function to send email
const sendEmail = async (values: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: `Shikkha Pro <${config.smtp.emailFrom}>`,
      to: values.to,
      subject: values.subject,
      text: values.html, // Using text instead of HTML
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        Importance: 'high',
      },
    });
    logger.info('Mail sent successfully', info.accepted);
  } catch (error) {
    errorLogger.error('Email', error);
  }
};

const sendVerificationEmail = async (to: string, otp: string) => {
  const subject = 'Shikkha Pro - Verify Your Email Address';
  const text = `Shikkha Pro - Verify Your Email Address

Here's your verification code: ${otp}

To verify your account, just enter this code in your app. The code expires in 30 minutes and you can only use it once.

This code is unique to you. Please don't share it with anyone.`;

  await sendEmail({ to, subject, html: text });
};

const sendResetPasswordEmail = async (to: string, otp: string) => {
  const subject = 'Shikkha Pro - Reset Your Password';
  const text = `Shikkha Pro - Reset Your Password

Here's your reset password code: ${otp}

To verify your email, just enter this code in your app. The code expires in 30 minutes and you can only use it once.

This code is unique to you. Please don't share it with anyone.`;

  await sendEmail({ to, subject, html: text });
};

// send login verification email
const sendLoginVerificationEmail = async (to: string, otp: string) => {
  const subject = 'Shikkha Pro - Verify Your Login';
  const text = `Shikkha Pro - Verify Your Login

Your login verification code: ${otp}

To complete your login, please enter this code in the app. The code expires in 30 minutes and can only be used once.

This code is unique to you. Please don't share it with anyone.`;

  await sendEmail({ to, subject, html: text });
};

const sendWelcomeEmail = async (to: string, password: string) => {
  const subject = 'Shikkha Pro - Welcome to the Platform!';
  const text = `Shikkha Pro - Welcome to the Platform!

Welcome to Shikkha Pro!

Your password is: ${password}`;

  await sendEmail({ to, subject, html: text });
};

// Function to send Admin/SuperAdmin Creation Email
const sendAdminOrSuperAdminCreationEmail = async (
  email: string,
  role: string,
  password: string,
  message?: string // Optional custom message
) => {
  const subject = `Shikkha Pro - Congratulations! You are now an ${role}`;
  const text = `Shikkha Pro - Congratulations! You are now an ${role}

Welcome to Shikkha Pro!

Congratulations! You've been granted the role of ${role} in our system.

To get started, please use the following credentials:
Email: ${email}
Password: ${password}

Note: ${message}

Feel free to reach out if you have any questions or need assistance. We're excited to have you on board!

Best regards,
The Shikkha Pro Team`;

  await sendEmail({ to: email, subject, html: text });
};

const sendSupportMessageEmail = async (
  userEmail: string,
  userName: string,
  message: string
) => {
  const adminEmail = config.smtp.emailFrom; // Admin email from config
  const text = `New Support Message

From: ${userName} (${userEmail})

Message:
${message}`;

  await sendEmail({
    to: adminEmail || '',
    subject: `Support Request from ${userName}`,
    html: text,
  });
};

const sendWarningEmail = async (
  to: string,
  userName: string,
  warningMessage: string
) => {
  const subject = 'Shikkha Pro - Important Warning Notification';
  const text = `Shikkha Pro - Important Warning Notification

Dear User ${userName},

We have reviewed your recent activity on the Shikkha Pro platform and found that it violates our community guidelines. Please review the details below:

⚠️ Warning: ${warningMessage}

If you continue to violate our guidelines, further actions such as account suspension may be taken. Please ensure you follow our terms of service.`;

  await sendEmail({ to, subject, html: text });
};

const sendBanNotificationEmail = async (
  to: string,
  userName: string,
  banMessage: string,
  banUntil: Date | null
) => {
  const subject = 'Important: Your Account Has Been Banned';
  const formattedBanUntil = banUntil ? banUntil.toUTCString() : 'Permanently';

  const text = `Important: Your Account Has Been Banned

Dear ${userName},

${banMessage}

Ban Expiry: ${formattedBanUntil}`;

  await sendEmail({ to, subject, html: text });
};

const sendReportConfirmation = async (to: string, userName: string) => {
  const subject = 'Thank You for Your Report!';
  const text = `Thank You for Your Report!

Hello ${userName},

We appreciate you taking the time to submit a report. Your feedback is valuable to us, and we'll review it as soon as possible. Rest assured, we'll take the necessary action and keep you updated.

If you have any more information to share or need assistance, feel free to reach out.

Thank you for helping us improve!

Best regards,
The Shikkha Pro Team`;

  await sendEmail({ to, subject, html: text });
};

export const emailService = {
  sendAdminOrSuperAdminCreationEmail,
  sendBanNotificationEmail,
  sendEmail,
  sendLoginVerificationEmail,
  sendReportConfirmation,
  sendResetPasswordEmail,
  sendSupportMessageEmail,
  sendVerificationEmail,
  sendWarningEmail,
  sendWelcomeEmail,
};