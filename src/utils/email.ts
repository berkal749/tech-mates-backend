import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'TechMates <noreply@techmates.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Email send error:', error);
  }
};

export const sendRegistrationConfirmation = async (
  email: string,
  github: string,
  discord: string
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #010102; color: #e5e1e6; padding: 40px; }
        .container { max-width: 500px; margin: 0 auto; background: #131316; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #d3beed; }
        .title { font-size: 20px; margin: 20px 0 10px; }
        .detail { background: rgba(211,190,237,0.1); padding: 12px 16px; border-radius: 8px; margin: 8px 0; font-size: 14px; }
        .label { color: #d3beed; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: rgba(229,225,230,0.5); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TechMates</div>
          <h1 class="title">Your corner is held!</h1>
        </div>
        <p>Welcome to the 48-Hour Buildathon. Here are your details:</p>
        <div class="detail"><span class="label">Email:</span> ${email}</div>
        <div class="detail"><span class="label">GitHub:</span> ${github}</div>
        <div class="detail"><span class="label">Discord:</span> ${discord}</div>
        <p style="margin-top: 20px; font-size: 14px; color: rgba(229,225,230,0.7);">
          We'll reach out before the doors open. One email, that's it.
        </p>
        <div class="footer">
          <p>TechMates — Hidden Corners Buildathon</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Your corner is held — TechMates Buildathon',
    html,
  });
};
