// app/api/contact/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const AUTO_REPLY_MESSAGES = {
  technical: `Thank you for reporting your technical issue with Replete AI. We understand how frustrating technical problems can be and we'll look into this as soon as possible.

Your issue has been logged and we'll get back to you with updates or questions if we need more information.

Best regards,
The Replete AI Team`,

  business: `Thank you for your business inquiry with Replete AI. We're excited about the possibility of working together and will review your proposal carefully.

We'll get back to you soon to discuss this further.

Best regards,
The Replete AI Team`,

  research: `Thank you for your interest in collaborating with Replete AI. We're always excited to work with others who share our passion for AI development.

We'll review your proposal and get back to you with our thoughts.

Best regards,
The Replete AI Team`,

  safety: `Thank you for bringing this safety or ethical concern to our attention. We take these matters very seriously and will review your report promptly.

If this is an urgent matter requiring immediate attention, please note that we prioritize safety-related reports.

Best regards,
The Replete AI Team`,

  general: `Thank you for reaching out to Replete AI. We appreciate your interest and will review your message soon.

We'll get back to you as soon as we can.

Best regards,
The Replete AI Team`
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, category, formData } = body;

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Format the form data into a readable structure
    const formDataFormatted = Object.entries(formData)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value}`)
      .join('\n    ');

    // Create a structured email body for admin
    const adminEmailBody = `
New Contact Form Submission
==========================

Category: ${category}
Submitted: ${new Date().toLocaleString()}

Contact Information
-----------------
Name: ${name}
Email: ${email}

Form Details
-----------
    ${formDataFormatted}
`;

    // Create email subject based on category and type
    const subjectPrefix = formData.urgency === 'High - Service unavailable' || 
                         formData.urgency === 'High - Immediate attention needed'
      ? '[URGENT] '
      : '';
    
    const emailSubject = `${subjectPrefix}${category} - ${
      formData.issueType || 
      formData.inquiryType || 
      formData.collaborationType || 
      formData.concernType || 
      'New Inquiry'
    }`;

    // Send the admin notification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'kquant@repleteai.com',
      subject: emailSubject,
      text: adminEmailBody,
      replyTo: email,
    });

    // Send auto-reply to the user
    const categoryKey = category.toLowerCase().split(' ')[0] as keyof typeof AUTO_REPLY_MESSAGES;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thank you for contacting Replete AI`,
      text: `Dear ${name},

${AUTO_REPLY_MESSAGES[categoryKey]}

Your Reference Number: REP-${Date.now().toString(36).toUpperCase()}

Please keep this reference number for future correspondence.

Note: This is an automated response. Please do not reply to this email.`,
    });

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Error sending email' },
      { status: 500 }
    );
  }
}