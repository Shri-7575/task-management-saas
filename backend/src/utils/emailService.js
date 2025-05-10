const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send verification email
  async sendVerificationEmail(email, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Email Verification',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #000; text-align: center;">Verify Your Email Address</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering! Please click the button below to verify your email address:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color: #666; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${verificationUrl}" style="color: #000; word-break: break-all;">
              ${verificationUrl}
            </a>
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(message);
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #000; text-align: center;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6;">
            You requested a password reset. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #666; line-height: 1.6;">
            This link will expire in 10 minutes.
          </p>
          <p style="color: #666; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${resetUrl}" style="color: #000; word-break: break-all;">
              ${resetUrl}
            </a>
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(message);
  }

  // Send task assignment notification
  async sendTaskAssignmentEmail(email, taskDetails) {
    const taskUrl = `${process.env.FRONTEND_URL}/tasks/${taskDetails.id}`;

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'New Task Assignment',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #000; text-align: center;">New Task Assigned</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #000; margin: 0 0 10px 0;">${taskDetails.title}</h3>
            <p style="color: #666; margin: 0 0 10px 0;">${taskDetails.description}</p>
            <p style="color: #666; margin: 0;">
              <strong>Due Date:</strong> ${new Date(taskDetails.dueDate).toLocaleDateString()}
            </p>
            <p style="color: #666; margin: 0;">
              <strong>Priority:</strong> ${taskDetails.priority}
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${taskUrl}" 
               style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Task
            </a>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(message);
  }

  // Send task status update notification
  async sendTaskUpdateEmail(email, taskDetails, updateType) {
    const taskUrl = `${process.env.FRONTEND_URL}/tasks/${taskDetails.id}`;

    let subject = '';
    let heading = '';
    let message = '';

    switch (updateType) {
      case 'completed':
        subject = 'Task Completed';
        heading = 'Task Marked as Complete';
        message = 'A task you\'re involved with has been marked as complete.';
        break;
      case 'in_progress':
        subject = 'Task Status Update';
        heading = 'Task In Progress';
        message = 'A task you\'re involved with has been started.';
        break;
      case 'under_review':
        subject = 'Task Ready for Review';
        heading = 'Task Needs Review';
        message = 'A task is ready for your review.';
        break;
      default:
        subject = 'Task Status Update';
        heading = 'Task Status Changed';
        message = 'A task you\'re involved with has been updated.';
    }

    const emailMessage = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #000; text-align: center;">${heading}</h2>
          <p style="color: #666; text-align: center;">${message}</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #000; margin: 0 0 10px 0;">${taskDetails.title}</h3>
            <p style="color: #666; margin: 0 0 10px 0;">${taskDetails.description}</p>
            <p style="color: #666; margin: 0;">
              <strong>Status:</strong> ${taskDetails.status}
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${taskUrl}" 
               style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Task
            </a>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(emailMessage);
  }

  // Send welcome email
  async sendWelcomeEmail(email, name) {
    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to Task Management SaaS',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #000; text-align: center;">Welcome to Task Management SaaS!</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="color: #666; line-height: 1.6;">
            We're excited to have you on board! Our platform will help you manage tasks efficiently and collaborate with your team seamlessly.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(message);
  }
}

module.exports = new EmailService();
