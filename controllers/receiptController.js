const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Receipt = require('../models/receipt');
const MembershipPlan = require('../models/MembershipPlan');

exports.createReceipt = async (userId, membershipPlanId, amount, paymentId = null) => {
  try {
   
    const plan = await MembershipPlan.findById(membershipPlanId);
    if (!plan) throw new Error('Membership plan not found for receipt');

    
    const doc = new PDFDocument();
    const fileName = `receipt_${Date.now()}.pdf`;
    const receiptsDir = path.join(__dirname, '..', 'public', 'receipts');

    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const filePath = path.join(receiptsDir, fileName);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    
    doc.fontSize(20).text('Gym Membership Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14)
      .text(`User ID: ${userId}`)
      .text(`Membership Plan: ${plan.name}`)
      .text(`Amount Paid: ₹${amount}`)
      .text(`Date: ${new Date().toLocaleString()}`);
    
    if (paymentId) {
      doc.text(`Payment Ref ID: ${paymentId}`);
    }

    doc.end();

    
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const receipt = new Receipt({
      userId,
      payment: paymentId || undefined,
      membershipPlan: membershipPlanId,
      amount,
      receiptUrl: `/receipts/${fileName}`,
      purchaseDate: new Date()
    });

    await receipt.save();
    console.log(' Receipt saved and PDF generated:', filePath);

    return receipt;
  } catch (err) {
    console.error(' Error creating receipt:', err.message);
    throw err;
  }
};
