const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const PDFDocument = require('pdfkit');

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ businessId: req.user.businessId }).populate('client').populate('booking');
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.user.businessId })
            .populate('client')
            .populate('booking')
            .populate('paymentHistory');
        if (invoice) {
            res.json(invoice);
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.exportInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`);
        doc.pipe(res);
        
        // Font settings
        const normalFont = 'Helvetica';
        const boldFont = 'Helvetica-Bold';
        
        // Add a primary border for the entire document
        doc.rect(30, 30, 535, 780).stroke();

        // 1. "TAX INVOICE" header
        doc.font(boldFont).fontSize(10).text('TAX INVOICE', 30, 40, { align: 'center', width: 535 });
        
        // Horizontal line separator 1
        doc.moveTo(30, 55).lineTo(565, 55).stroke();
        
        // 2. Company Details + Contact Details (Split by vertical line)
        // Left Box (Company)
        doc.font(boldFont).fontSize(14).text(invoice.companyName, 35, 60);
        doc.font(normalFont).fontSize(9).text(invoice.companyAddress, 35, 75);
        doc.font(boldFont).fontSize(9).text(`GSTIN: ${invoice.companyGSTIN}`, 35, 105);
        doc.text(`State: ${invoice.companyState}, Code: ${invoice.companyStateCode}`, 35, 120);

        // Vertical Sep 1 (Center Top)
        doc.moveTo(350, 55).lineTo(350, 135).stroke();

        // Right Box (Contact)
        doc.font(normalFont).fontSize(9).text(`Contact:\t${invoice.companyContact}`, 355, 60);
        doc.text(`E-mail:\t${invoice.companyEmail}`, 355, 75);

        // Horizontal line separator inside right box for invoice no
        doc.moveTo(350, 100).lineTo(565, 100).stroke();
        
        doc.font(boldFont).text('Invoice No.', 355, 105);
        doc.text('Invoice Dated', 460, 105);
        doc.font(normalFont).text(invoice.invoiceNumber, 355, 120);
        const invDateObj = new Date(invoice.issueDate);
        doc.text(`${invDateObj.getDate()}-${invDateObj.toLocaleString('default', { month: 'short' })}-${invDateObj.getFullYear()}`, 460, 120);

        // Horizontal line separator 2
        doc.moveTo(30, 135).lineTo(565, 135).stroke();

        // 3. Buyer & Function Info
        doc.font(boldFont).text('Buyer (Bill to)', 35, 140);
        doc.font(normalFont).text(`Name :   ${invoice.buyerName}`, 35, 155);
        doc.text(`Address : ${invoice.buyerAddress}`, 35, 170);
        doc.font(boldFont).text(`GSTIN :   ${invoice.buyerGSTIN || 'N/A'}`, 35, 220);
        doc.text(`State :   ${invoice.buyerState || 'N/A'}     State Code : ${invoice.buyerStateCode || 'N/A'}`, 35, 235);

        // Vertical Sep 2
        doc.moveTo(350, 135).lineTo(350, 250).stroke();

        // Right Box (Function Address)
        doc.font(boldFont).text('FUNCTION ADDRESS:', 355, 140);
        doc.font(normalFont).text(invoice.functionAddress || invoice.buyerAddress, 355, 155);
        
        // Horizontal line inside right box for Date of Supply
        doc.moveTo(350, 230).lineTo(565, 230).stroke();
        doc.font(boldFont).text(`Date of Supply : ${invoice.dateOfSupply || 'N/A'}`, 355, 235);

        // Horizontal line separator 3
        doc.moveTo(30, 250).lineTo(565, 250).stroke();

        // 4. Items Table
        // Table Headers
        doc.font(normalFont).text('S.No.', 35, 255);
        doc.text('Description of Goods', 150, 255);
        doc.text('Quantity', 355, 255);
        doc.text('Rate', 430, 255);
        doc.text('Amount', 500, 255);

        // Table Header Underline
        doc.moveTo(30, 270).lineTo(565, 270).stroke();

        // Vertical lines for Item Table
        doc.moveTo(60, 250).lineTo(60, 550).stroke(); // After S.No.
        doc.moveTo(350, 250).lineTo(350, 550).stroke(); // After Description
        doc.moveTo(420, 250).lineTo(420, 550).stroke(); // After Quantity
        doc.moveTo(480, 250).lineTo(480, 550).stroke(); // After Rate

        // Render Items
        let yPos = 280;
        let sNo = 1;
        if (invoice.items && invoice.items.length > 0) {
            invoice.items.forEach(item => {
                doc.text(sNo.toString(), 35, yPos, { width: 25, align: 'center' });
                doc.text(item.description, 65, yPos, { width: 280 });
                doc.text(item.quantity, 355, yPos, { width: 60, align: 'center' });
                doc.text(`₹ ${item.rate.toFixed(2)}`, 425, yPos, { width: 50, align: 'right' });
                doc.text(item.amount.toFixed(2), 485, yPos, { width: 75, align: 'right' });
                sNo++;
                yPos += 15;
            });
        }

        // Horizontal line separator 4 (Bottom of Table)
        doc.moveTo(30, 550).lineTo(565, 550).stroke();

        // 5. Totals & Footer
        // Left side Amount in Words
        function numberToWords(num) { 
           // Extremely simplified for demonstration. You may want a real package for this.
           return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " RUPEES ONLY"; 
        }
        doc.font(boldFont).text('Amount (in words):', 35, 555);
        doc.font(normalFont).text(numberToWords(Math.round(invoice.netPayableAmount)), 35, 570, { width: 310 });

        // Left Side Bank Details
        doc.moveTo(30, 610).lineTo(350, 610).stroke();
        doc.font(boldFont).text(`BANK DETAILS: ${invoice.companyName}`, 35, 615, { align: 'center', width: 310 });
        doc.font(normalFont).text(`${invoice.bankName}`, 35, 630, { align: 'center', width: 310 });
        doc.text(`IFSC Code: ${invoice.ifscCode}`, 35, 645, { align: 'center', width: 310 });
        doc.text(`Account No.: ${invoice.accountNo}`, 35, 660, { align: 'center', width: 310 });

        doc.moveTo(30, 680).lineTo(350, 680).stroke();
        doc.font(boldFont).text('Terms & Conditions:', 35, 685);
        doc.font(normalFont).text('1. Subject to Delhi Jurisdiction only.', 35, 700);

        // Right side Totals Box
        let currentY = 550;
        doc.moveTo(350, 550).lineTo(350, 680).stroke(); // Vertical separator for totals
        doc.moveTo(480, 550).lineTo(480, 680).stroke(); // Vertical separator for amounts in total box

        // Helper for Total rows
        const addTotalRow = (label, amt, cY) => {
            doc.text(label, 355, cY + 5);
            doc.text(amt ? '₹' : '', 485, cY + 5);
            if(amt) doc.text(amt.toFixed(2), 485 + 10, cY + 5, { width: 65, align: 'right' });
            doc.moveTo(350, cY + 20).lineTo(565, cY + 20).stroke();
        };

        addTotalRow('Total Amount before GST', invoice.totalAmountBeforeGST, currentY); currentY += 20;
        addTotalRow(`Add: CGST @ ${invoice.cgstRate}%`, invoice.cgstAmount, currentY); currentY += 20;
        addTotalRow(`Add: SGST @ ${invoice.sgstRate}%`, invoice.sgstAmount, currentY); currentY += 20;
        addTotalRow(`Add: IGST @ ${invoice.igstRate}%`, invoice.igstAmount, currentY); currentY += 20;
        addTotalRow('TOTAL Amount with GST', invoice.totalAmountWithGST, currentY); currentY += 20;
        
        doc.font(boldFont).text('NET PAYABLE AMOUNT', 355, currentY + 5);
        doc.text('₹', 485, currentY + 5);
        doc.text(invoice.netPayableAmount.toFixed(0), 495, currentY + 5, { width: 65, align: 'right' });
        doc.moveTo(350, currentY + 20).lineTo(565, currentY + 20).stroke();
        // Extend line slightly for Net Payable box effect
        doc.moveTo(350, currentY + 25).lineTo(350, 680).stroke();

        // 6. Signatory
        doc.font(boldFont).text(`For ${invoice.companyName}`, 355, 700, { align: 'center', width: 210, color: 'blue' });
        // Assume signature image could go here, for now placeholder
        doc.font(normalFont).text('(Proprietor)', 355, 760, { align: 'center', width: 210, color: 'blue' });

        doc.fillColor('black').font(normalFont).fontSize(8).text('Certified that the particulars given above are true and correct.', 30, 785, { align: 'center', width: 535 });

        doc.end();
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
