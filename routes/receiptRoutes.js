const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const path = require('path');
const fs = require('fs');

// GET /receipt/download/:id => Download receipt PDF
router.get('/download/:id', async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt || !receipt.receiptUrl) {
      return res.status(404).send('Receipt not found');
    }

    const filePath = path.join(__dirname, '..', 'public', receipt.receiptUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Receipt PDF file not found');
    }

    const fileName = path.basename(filePath);

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.download(filePath, fileName, err => {
      if (err) {
        console.error('Error sending receipt file:', err);
        if (!res.headersSent) {
          res.status(500).send('Error downloading file');
        }
      }
    });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
