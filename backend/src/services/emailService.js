import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;
const mockEmailLogPath = path.resolve('./src/uploads/mock_emails.log');

// Setup Nodemailer SMTP carrier
try {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // True for 465, false for other ports
      auth: { user, pass }
    });
    console.log(`[EMAIL SMTP] Transporter configured successfully: ${host}:${port}`);
  } else {
    console.warn('[EMAIL WARNING] SMTP credentials are not fully configured. Transactions will log to local mock file.');
  }
} catch (error) {
  console.warn(`[EMAIL EXCEPTION] Failed to configure SMTP: ${error.message}`);
}

/**
 * Dispatch transactional emails
 * @param {string} to 
 * @param {string} subject 
 * @param {string} text 
 * @param {string} html 
 */
export const sendEmail = async (to, subject, text, html) => {
  const fromEmail = process.env.SMTP_FROM || '"RepoMind AI" <noreply@repomind.ai>';

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text,
        html
      });
      console.log(`[EMAIL SUCCESS] Message delivered successfully to: ${to} (MessageID: ${info.messageId})`);
      return true;
    } catch (err) {
      console.error(`[EMAIL SMTP ERROR] SMTP carrier rejected mail: ${err.message}. Saving to mock log.`);
    }
  }

  // Fallback Logger
  const timestamp = new Date().toISOString();
  const rawLog = `
========================================
[EMAIL MOCK TRACE] ${timestamp}
To: ${to}
Subject: ${subject}
Text Content: ${text}
HTML Length: ${html ? html.length : 0} bytes
========================================
`;
  
  try {
    fs.appendFileSync(mockEmailLogPath, rawLog);
    console.log(`[EMAIL LOGGED] SMTP offline. Transaction saved locally to: ${mockEmailLogPath}`);
  } catch (err) {
    console.error('[EMAIL LOG ERROR] Failed to write mock email log:', err.message);
  }

  return true;
};

// ------------------------------------------
// HTML TRANSACTIONAL TEMPLATE GENERATORS
// ------------------------------------------

const wrapperStyle = `
  background-color: #0b0f19;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #f3f4f6;
  padding: 40px 20px;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 12px;
  border: 1px solid #1e293b;
`;

const buttonStyle = `
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  padding: 12px 28px;
  text-decoration: none;
  font-weight: 600;
  border-radius: 8px;
  display: inline-block;
  margin-top: 15px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
`;

export const getWelcomeEmail = (name) => {
  const text = `Hi ${name},\n\nWelcome to RepoMind AI! We are thrilled to help you analyze, catalog, and scale your codebases with AI-driven clarity. Get started by uploading your repository.`;
  
  const html = `
    <div style="${wrapperStyle}">
      <h2 style="color: #3b82f6; font-size: 24px; font-weight: 700; margin-bottom: 20px;">Welcome to RepoMind AI, ${name}!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">We are absolutely thrilled to have you onboard. RepoMind AI bridges repository analysis and automated documentation pipelines.</p>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">With your account, you can upload ZIP repositories or paste GitHub URLs to automatically pre-render 10 separate Mermaid diagrams, DOCX specs, slide decks, and print-ready Puppeteer PDFs.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://repomind.ai/dashboard" style="${buttonStyle}">Explore Your Dashboard</a>
      </div>
      <hr style="border-color: #1e293b; margin: 30px 0;">
      <p style="font-size: 12px; color: #64748b; text-align: center;">© 2026 RepoMind AI Inc. 100 Pine St, San Francisco, CA.</p>
    </div>
  `;
  return { subject: 'Welcome to RepoMind AI! 🚀', text, html };
};

export const getPasswordResetEmail = (name, token) => {
  const resetLink = `https://repomind.ai/auth/reset-password?token=${token}`;
  const text = `Hi ${name},\n\nWe received a request to reset your password. Reset it here: ${resetLink}\n\nIf you did not make this request, you can safely ignore this email.`;
  
  const html = `
    <div style="${wrapperStyle}">
      <h2 style="color: #ef4444; font-size: 22px; font-weight: 700; margin-bottom: 20px;">Password Reset Request</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">We received a request to reset your password. Click the button below to establish a new password for your account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="${buttonStyle}">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #94a3b8;">This password reset link will expire in 60 minutes for security purposes.</p>
      <hr style="border-color: #1e293b; margin: 30px 0;">
      <p style="font-size: 12px; color: #64748b; text-align: center;">If you did not request this, you can ignore this alert securely.</p>
    </div>
  `;
  return { subject: 'Reset your RepoMind AI Password 🔒', text, html };
};

export const getAnalysisCompleteEmail = (name, projectName, projectId) => {
  const downloadUrl = `https://repomind.ai/projects/${projectId}/documents`;
  const text = `Hi ${name},\n\nGreat news! The codebase analysis and document generation for "${projectName}" is complete! Read your PDF reports and explore slide decks here: ${downloadUrl}`;
  
  const html = `
    <div style="${wrapperStyle}">
      <h2 style="color: #10b981; font-size: 22px; font-weight: 700; margin-bottom: 20px;">Analysis Completed! 🎉</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">Our background scanning workers have finished analyzing your repository <strong>${projectName}</strong>!</p>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">The system has successfully generated:
        <ul style="color: #cbd5e1; font-size: 14px; padding-left: 20px;">
          <li>A4 Technical Documentation Report (PDF)</li>
          <li>Enterprise Project Blueprints (Word DOCX)</li>
          <li>Themed Slide Presentation (PowerPoint PPTX)</li>
          <li>10 UML Vector Architecture Diagrams (SVGs)</li>
        </ul>
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${downloadUrl}" style="${buttonStyle}">View Generated Assets</a>
      </div>
      <hr style="border-color: #1e293b; margin: 30px 0;">
      <p style="font-size: 12px; color: #64748b; text-align: center;">Brought to you by RepoMind AI background processing worker pools.</p>
    </div>
  `;
  return { subject: `Analysis Complete: ${projectName} is ready! 🚀`, text, html };
};

export const getBillingInvoiceEmail = (name, plan, amount) => {
  const text = `Hi ${name},\n\nThank you for your business! Your payment of $${amount} for your RepoMind AI "${plan}" subscription was successful. Your account quotas have been refreshed.`;
  
  const html = `
    <div style="${wrapperStyle}">
      <h2 style="color: #3b82f6; font-size: 22px; font-weight: 700; margin-bottom: 20px;">Billing Invoice Payment Successful 💳</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">Thank you for upgrading! Your transaction was processed successfully. Below is your billing summary:</p>
      <div style="background-color: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #334155;">
        <table style="width: 100%; border-collapse: collapse; color: #f3f4f6;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Plan Tier:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; text-transform: uppercase;">${plan} Plan</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Amount Billed:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #10b981;">$${amount} USD</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Interval:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">Monthly billing cycle</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 14px; color: #94a3b8; text-align: center;">All your monthly upload and token credit allowances have been refilled!</p>
      <hr style="border-color: #1e293b; margin: 30px 0;">
      <p style="font-size: 12px; color: #64748b; text-align: center;">If you have any billing queries, drop a line to payments@repomind.ai</p>
    </div>
  `;
  return { subject: `SaaS Subscription Invoice: payment complete! 💳`, text, html };
};
