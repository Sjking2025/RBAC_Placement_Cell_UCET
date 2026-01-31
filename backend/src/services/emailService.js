const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

/**
 * Send email
 */
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Placement Cell'}" <${process.env.FROM_EMAIL || 'noreply@placementcell.com'}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error('Email sending failed:', error);
        throw error;
    }
};

/**
 * Send welcome email
 */
exports.sendWelcomeEmail = async (email, firstName) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to Placement Cell!</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for registering with our Placement Cell Management System.</p>
      <p>You can now access job opportunities, track your applications, and manage your profile.</p>
      <p>Best regards,<br>Placement Cell Team</p>
    </div>
  `;

    return sendEmail({
        to: email,
        subject: 'Welcome to Placement Cell',
        html
    });
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, resetUrl) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Password Reset Request</h1>
      <p>You have requested to reset your password.</p>
      <p>Please click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>Placement Cell Team</p>
    </div>
  `;

    return sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html
    });
};

/**
 * Send application status update email
 */
exports.sendApplicationStatusEmail = async (email, firstName, jobTitle, status) => {
    const statusMessages = {
        shortlisted: 'Congratulations! You have been shortlisted',
        rejected: 'We regret to inform you that your application was not selected',
        interview_scheduled: 'Your interview has been scheduled',
        selected: 'Congratulations! You have been selected',
        offer_accepted: 'Your offer acceptance has been recorded'
    };

    const message = statusMessages[status] || `Your application status has been updated to: ${status}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Application Update</h1>
      <p>Hi ${firstName},</p>
      <p>${message} for the position of <strong>${jobTitle}</strong>.</p>
      <p>Please log in to your account to view more details.</p>
      <p>Best regards,<br>Placement Cell Team</p>
    </div>
  `;

    return sendEmail({
        to: email,
        subject: `Application Update: ${jobTitle}`,
        html
    });
};

/**
 * Send interview notification email
 */
exports.sendInterviewNotificationEmail = async (email, firstName, interviewDetails) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Interview Scheduled</h1>
      <p>Hi ${firstName},</p>
      <p>Your interview has been scheduled with the following details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${interviewDetails.date}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${interviewDetails.time}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Type</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${interviewDetails.type}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Mode</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${interviewDetails.mode}</td>
        </tr>
        ${interviewDetails.location ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Location</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${interviewDetails.location}</td>
        </tr>
        ` : ''}
        ${interviewDetails.meetingLink ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Meeting Link</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;"><a href="${interviewDetails.meetingLink}">${interviewDetails.meetingLink}</a></td>
        </tr>
        ` : ''}
      </table>
      <p>Please be on time and prepared for your interview.</p>
      <p>Best regards,<br>Placement Cell Team</p>
    </div>
  `;

    return sendEmail({
        to: email,
        subject: 'Interview Scheduled',
        html
    });
};

/**
 * Send announcement email
 */
exports.sendAnnouncementEmail = async (emails, announcement) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">${announcement.title}</h1>
      <div style="padding: 16px; background-color: #f3f4f6; border-radius: 8px; margin: 16px 0;">
        ${announcement.content}
      </div>
      <p>Please log in to your account for more details.</p>
      <p>Best regards,<br>Placement Cell Team</p>
    </div>
  `;

    // Send to multiple recipients
    const promises = emails.map(email =>
        sendEmail({
            to: email,
            subject: `Announcement: ${announcement.title}`,
            html
        })
    );

    return Promise.allSettled(promises);
};

module.exports = exports;
