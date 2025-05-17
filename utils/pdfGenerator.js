const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateReceiptPDF(receipt, user, fileName) {
  return new Promise((resolve, reject) => {
    try {
      const receiptsDir = path.join(__dirname, '..', 'public');
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const filePath = path.join(receiptsDir, fileName);
      const doc = new PDFDocument();

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(20).text('Payment Receipt', { align: 'center' });
      doc.moveDown();

      doc.fontSize(14).text(`Name: ${user.name || user.username || 'N/A'}`);

      // Show membership plan name (populated or fallback)
      const planName = receipt.membershipPlan?.name || receipt.membershipPlan?.toString() || 'N/A';
      doc.text(`Membership Plan: ${planName}`);

      doc.text(`Amount Paid: ₹${receipt.amount}`);

      const purchaseDate = receipt.purchaseDate || new Date();
      doc.text(`Purchase Date: ${purchaseDate.toDateString()}`);

      doc.moveDown();
      doc.text('Thank you for your payment!', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        console.log('PDF generated:', filePath);
        resolve(filePath);
      });
      stream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateReceiptPDF };
