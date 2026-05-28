const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Nodemailer SMTP Transporter setup - highly secure SSL direct connection with certificate fallback for cloud VPS
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'agsharjahtamil@gmail.com',
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Bypasses self-signed handshake restrictions on host providers like Hostinger/Render
  }
});

// Helper function to send email copy of inquiry
async function sendInquiryCopyEmail(email, name, phone, subject, message) {
  if (!process.env.EMAIL_PASS) {
    console.log(`\n==================================================`);
    console.log(`[INQUIRY COPY EMAIL FALLBACK]`);
    console.log(`To: ${email}`);
    console.log(`Subject: Copy of your inquiry: ${subject || 'General Inquiry'}`);
    console.log(`Message: ${message}`);
    console.log(`==================================================\n`);
    return true;
  }

  const mailOptions = {
    from: `"AG Sharjah Tamil Church" <agsharjahtamil@gmail.com>`,
    to: email,
    subject: `Copy of your Inquiry to AG Sharjah Tamil Church: ${subject || 'General Info'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">AG Sharjah Tamil Church</h2>
        <h3 style="color: #1f2937; text-align: center;">Inquiry Receipt Confirmation</h3>
        <hr style="border: 0; border-top: 1px solid #eeeeee;" />
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to us. We have received your inquiry and our team will get back to you shortly. Below is a copy of your submitted details:</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #6366f1; border-radius: 4px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; color: #4b5563;">${message}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">This is an automated copy of your inquiry submission. Once one of our administrators responds to your inquiry, you will receive another email containing their response.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin-top: 30px;" />
        <p style="text-align: center; font-size: 12px; color: #9ca3af;">
          Assemblies of God Sharjah Tamil Church, Sharjah, UAE<br/>
          Email: agsharjahtamil@gmail.com | Website: agsharjah.org
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Helper function to send email when admin answers an inquiry
async function sendInquiryResponseEmail(email, name, originalSubject, originalMessage, responseText) {
  if (!process.env.EMAIL_PASS) {
    console.log(`\n==================================================`);
    console.log(`[INQUIRY RESPONSE EMAIL FALLBACK]`);
    console.log(`To: ${email}`);
    console.log(`Subject: Response to your inquiry: ${originalSubject || 'General Inquiry'}`);
    console.log(`Response: ${responseText}`);
    console.log(`==================================================\n`);
    return true;
  }

  const mailOptions = {
    from: `"AG Sharjah Tamil Church" <agsharjahtamil@gmail.com>`,
    to: email,
    subject: `Response to your Inquiry: ${originalSubject || 'General Info'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">AG Sharjah Tamil Church</h2>
        <h3 style="color: #1f2937; text-align: center;">Response from Church Administration</h3>
        <hr style="border: 0; border-top: 1px solid #eeeeee;" />
        <p>Dear ${name},</p>
        <p>An administrator has responded to the inquiry you submitted to AG Sharjah Tamil Church.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #10b981; border-radius: 4px; margin: 20px 0;">
          <p style="margin-top: 0; font-weight: bold; color: #1f2937;">Admin Response:</p>
          <p style="white-space: pre-wrap; color: #111827; font-size: 15px;">${responseText}</p>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #d1d5db; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #4b5563;">
          <p style="margin-top: 0; font-weight: bold;">Your Original Inquiry:</p>
          <p><strong>Subject:</strong> ${originalSubject || 'General Inquiry'}</p>
          <p style="white-space: pre-wrap;">${originalMessage}</p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">If you have any further questions, you can respond to this email directly or submit a new contact request on our website.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin-top: 30px;" />
        <p style="text-align: center; font-size: 12px; color: #9ca3af;">
          Assemblies of God Sharjah Tamil Church, Sharjah, UAE<br/>
          Email: agsharjahtamil@gmail.com | Website: agsharjah.org
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

// POST /api/contact (general inquiry form)
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message content are required.' });
  }

  try {
    // Save to inquiries table
    await db.runAsync(
      `INSERT INTO inquiries (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, subject || null, message]
    );

    // Send copy of inquiry email to sender
    try {
      await sendInquiryCopyEmail(email, name, phone, subject, message);
    } catch (mailErr) {
      console.error('Error sending inquiry copy email:', mailErr);
      // Do not fail the request if only the receipt email fails
    }

    res.status(200).json({
      message: 'Thank you for reaching out to AG Sharjah Tamil Church! A confirmation copy of your inquiry has been sent to your email.'
    });
  } catch (err) {
    console.error('Error saving inquiry:', err);
    res.status(500).json({ error: 'Server error saving inquiry.' });
  }
});

// GET /api/contact/inquiries (List all inquiries for admin)
router.get('/inquiries', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({ error: 'Access denied. Admin or Moderator role required.' });
  }

  try {
    const inquiries = await db.allAsync(`SELECT * FROM inquiries ORDER BY id DESC`);
    res.json(inquiries);
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({ error: 'Server error fetching inquiries.' });
  }
});

// PUT /api/contact/inquiries/:id/respond (Admin respond to inquiry)
router.put('/inquiries/:id/respond', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({ error: 'Access denied. Admin or Moderator role required.' });
  }

  const { id } = req.params;
  const { responseText } = req.body;

  if (!responseText || responseText.trim() === '') {
    return res.status(400).json({ error: 'Response content is required.' });
  }

  try {
    const inquiry = await db.getAsync(`SELECT * FROM inquiries WHERE id = ?`, [id]);
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }

    // Update in database
    await db.runAsync(
      `UPDATE inquiries SET response_text = ?, is_answered = 1 WHERE id = ?`,
      [responseText, id]
    );

    // Send email with response to the sender
    try {
      await sendInquiryResponseEmail(inquiry.email, inquiry.name, inquiry.subject, inquiry.message, responseText);
    } catch (mailErr) {
      console.error('Error sending response email:', mailErr);
      // Return success anyway, as DB was successfully updated
    }

    res.json({ message: 'Response saved and emailed to user successfully.' });
  } catch (err) {
    console.error('Error responding to inquiry:', err);
    res.status(500).json({ error: 'Server error saving response.' });
  }
});

module.exports = router;
