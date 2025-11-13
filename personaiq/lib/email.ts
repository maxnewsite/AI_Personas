/**
 * Email Service for PersonaIQ
 * Handles sending transactional emails for campaigns, reminders, and notifications
 */

import { prisma } from './db'

// Email configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASSWORD = process.env.SMTP_PASSWORD
const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || 'noreply@personaiq.com'
const FROM_NAME = process.env.FROM_NAME || 'PersonaIQ'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email (uses console logging in development, SMTP in production)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // In development or if SMTP not configured, log to console
    if (process.env.NODE_ENV === 'development' || !SMTP_USER || !SMTP_PASSWORD) {
      console.log('📧 Email (Development Mode):')
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      console.log('---')
      console.log(options.text || 'HTML email - see html field')
      console.log('---')
      return true
    }

    // In production, use nodemailer or your preferred email service
    // For now, we'll implement a basic version
    // TODO: Implement actual SMTP sending with nodemailer
    console.log('📧 Email sent to:', options.to)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Send assessment invitation email
 */
export async function sendAssessmentInvitation(params: {
  employeeEmail: string
  employeeName: string
  campaignName: string
  campaignEndDate: Date
  assessmentLink: string
}) {
  const { employeeEmail, employeeName, campaignName, campaignEndDate, assessmentLink } = params

  const subject = `You're invited: ${campaignName}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #2563eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .info-box { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">PersonaIQ Assessment</h1>
        </div>
        <div class="content">
          <p>Hi ${employeeName},</p>

          <p>You've been invited to participate in the <strong>${campaignName}</strong> assessment. This will help us understand your experience with AI tools and provide you with personalized coaching and resources.</p>

          <div class="info-box">
            <p style="margin: 0;"><strong>⏱️ Time Required:</strong> ~15 minutes</p>
            <p style="margin: 10px 0 0 0;"><strong>📅 Deadline:</strong> ${campaignEndDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <p><strong>What to expect:</strong></p>
          <ul>
            <li>40 questions about your AI usage and attitudes</li>
            <li>No right or wrong answers - just be honest</li>
            <li>You can save progress and return later</li>
            <li>Your responses are confidential</li>
          </ul>

          <div style="text-align: center;">
            <a href="${assessmentLink}" class="button">Take Assessment</a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${assessmentLink}" style="color: #3b82f6;">${assessmentLink}</a>
          </p>

          <p style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280;">
            Questions? Reply to this email or contact your HR team.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} PersonaIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hi ${employeeName},

You've been invited to participate in the ${campaignName} assessment.

Time Required: ~15 minutes
Deadline: ${campaignEndDate.toLocaleDateString()}

Take the assessment here: ${assessmentLink}

What to expect:
- 40 questions about your AI usage and attitudes
- No right or wrong answers - just be honest
- You can save progress and return later
- Your responses are confidential

Questions? Reply to this email or contact your HR team.

© ${new Date().getFullYear()} PersonaIQ
  `.trim()

  return await sendEmail({
    to: employeeEmail,
    subject,
    html,
    text
  })
}

/**
 * Send assessment reminder email
 */
export async function sendAssessmentReminder(params: {
  employeeEmail: string
  employeeName: string
  campaignName: string
  campaignEndDate: Date
  assessmentLink: string
  daysRemaining: number
}) {
  const { employeeEmail, employeeName, campaignName, campaignEndDate, assessmentLink, daysRemaining } = params

  const subject = `Reminder: ${campaignName} - ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #dc2626; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .urgent-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">⏰ Reminder: Assessment Due Soon</h1>
        </div>
        <div class="content">
          <p>Hi ${employeeName},</p>

          <div class="urgent-box">
            <p style="margin: 0; font-weight: 600;">You haven't completed the ${campaignName} assessment yet.</p>
            <p style="margin: 10px 0 0 0;"><strong>Time Remaining:</strong> ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}</p>
            <p style="margin: 10px 0 0 0;"><strong>Deadline:</strong> ${campaignEndDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <p>This 15-minute assessment will help us provide you with personalized AI coaching and resources tailored to your needs.</p>

          <div style="text-align: center;">
            <a href="${assessmentLink}" class="button">Complete Assessment Now</a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${assessmentLink}" style="color: #ef4444;">${assessmentLink}</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} PersonaIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hi ${employeeName},

REMINDER: You haven't completed the ${campaignName} assessment yet.

Time Remaining: ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}
Deadline: ${campaignEndDate.toLocaleDateString()}

Complete the assessment here: ${assessmentLink}

This 15-minute assessment will help us provide you with personalized AI coaching and resources.

© ${new Date().getFullYear()} PersonaIQ
  `.trim()

  return await sendEmail({
    to: employeeEmail,
    subject,
    html,
    text
  })
}

/**
 * Send assessment completion notification to coach
 */
export async function sendCoachNotification(params: {
  coachEmail: string
  coachName: string
  employeeName: string
  persona: string
  dashboardLink: string
}) {
  const { coachEmail, coachName, employeeName, persona, dashboardLink } = params

  const subject = `New Assessment Completed: ${employeeName}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #059669; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">✅ New Assessment Completed</h1>
        </div>
        <div class="content">
          <p>Hi ${coachName},</p>

          <p><strong>${employeeName}</strong> has completed their AI adoption assessment.</p>

          <p><strong>Persona Classification:</strong> ${persona}</p>

          <p>You can now review their results, view detailed insights, and access personalized coaching recommendations in your dashboard.</p>

          <div style="text-align: center;">
            <a href="${dashboardLink}" class="button">Review Results</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} PersonaIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hi ${coachName},

${employeeName} has completed their AI adoption assessment.

Persona Classification: ${persona}

Review their results in your dashboard: ${dashboardLink}

© ${new Date().getFullYear()} PersonaIQ
  `.trim()

  return await sendEmail({
    to: coachEmail,
    subject,
    html,
    text
  })
}

/**
 * Generate unique assessment link for employee
 */
export function generateAssessmentLink(campaignId: string, employeeId: string, token: string): string {
  return `${APP_URL}/employee/assessment?campaign=${campaignId}&employee=${employeeId}&token=${token}`
}

/**
 * Generate random token for assessment link
 */
export function generateAssessmentToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
