const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

// POST /api/upload
// Accepts base64 encoded data to upload images or documents securely
router.post('/', authenticateToken, async (req, res) => {
  const { fileName, base64Data, subFolder } = req.body;

  if (!fileName || !base64Data) {
    return res.status(400).json({ error: 'Filename and base64Data are required.' });
  }

  try {
    // Extract base64 content
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 payload.' });
    }

    const fileBuffer = Buffer.from(matches[2], 'base64');
    const folder = subFolder === 'resources' ? 'resources' : 'images';
    const uploadDir = path.join(__dirname, '..', 'public', folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique clean filename
    const fileExt = path.extname(fileName) || '.png';
    const baseName = path.basename(fileName, fileExt).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueName = `${Date.now()}_${baseName}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, fileBuffer);

    // Dynamic clean public URL
    const publicUrl = `/${folder}/${uniqueName}`;
    res.json({ fileUrl: publicUrl });
  } catch (err) {
    console.error('[Upload Router Error]:', err);
    res.status(500).json({ error: 'Server error saving uploaded file.' });
  }
});

module.exports = router;
