const express = require('express');
const router = express.Router();

// POST /api/contact (general inquiry form)
router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message content are required.' });
  }

  // Simulated email delivery to the church secretary/office
  console.log(`[SMTP Mailer Mock]: General inquiry from: ${name} (${email}). Subject: ${subject || 'General Info'}`);
  console.log(`[SMTP Mailer Mock]: Content: ${message}`);
  console.log(`[SMTP Mailer Mock]: Sending auto-thank you reply to: ${email}`);

  res.status(200).json({
    message: 'Thank you for reaching out to AG Sharjah Tamil Church! Our church office will contact you shortly.'
  });
});

module.exports = router;
