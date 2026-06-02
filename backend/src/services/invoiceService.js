import fs from 'fs';
import path from 'path';
import Invoice from '../models/Invoice.js';

class InvoiceService {
  constructor() {
    this.invoicesDir = path.resolve('./src/uploads/invoices');
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
    }
  }

  /**
   * Programmatically compile a professional printable text invoice document
   */
  async compileInvoice(userId, paymentRecord, planId, billingInterval, customerDetails = {}) {
    const amount = paymentRecord.amount / 100; // convert from cents
    
    // Calculate 18% GST (Goods & Services Tax) or dynamic VAT
    const taxRate = 0.18;
    const baseAmount = parseFloat((amount / (1 + taxRate)).toFixed(2));
    const taxAmount = parseFloat((amount - baseAmount).toFixed(2));
    const totalAmount = amount;

    // Merge customer default details
    const mergedDetails = {
      name: customerDetails.name || 'SaaS Client',
      email: customerDetails.email || 'billing@repomind.ai',
      companyName: customerDetails.companyName || 'Developer Inc.',
      billingAddress: customerDetails.billingAddress || '100 Pine St, Suite 12, San Francisco, CA',
      gstIn: customerDetails.gstIn || '27AAACR1234M1Z2' // Sample Indian GST number format
    };

    // 1. Create Invoice record in database (pre-save generates INV-YEAR-XXXX sequentially)
    const invoice = await Invoice.create({
      userId,
      paymentId: paymentRecord._id,
      plan: planId,
      amount: baseAmount,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      currency: paymentRecord.currency,
      billingInterval,
      customerDetails: mergedDetails,
      paymentDate: new Date()
    });

    // 2. Draft a beautiful printable text invoice manifest
    const invoiceText = `
========================================================================
                      REPOMIND AI TAX INVOICE
========================================================================
Invoice Number: ${invoice.invoiceNumber}
Payment Date:   ${invoice.paymentDate.toLocaleString()}
Status:         PAID
========================================================================

CLIENT DETAILS:
Name:           ${invoice.customerDetails.name}
Email:          ${invoice.customerDetails.email}
Company:        ${invoice.customerDetails.companyName}
Address:        ${invoice.customerDetails.billingAddress}
Client GSTIN:   ${invoice.customerDetails.gstIn}

========================================================================
PROVIDER DETAILS:
Name:           RepoMind AI Inc.
Tax Registry:   GSTIN-27AAACR9999M1ZP
Address:        120 Pine Street, San Francisco, CA 94111
Contact:        finance@repomind.ai
========================================================================

BILLING BREAKDOWN:
------------------------------------------------------------------------
Description                        Qty      Unit Price      Total
------------------------------------------------------------------------
RepoMind AI Subscription         1        $${invoice.amount.toFixed(2)}       $${invoice.amount.toFixed(2)}
- Plan Level:  ${invoice.plan.toUpperCase()}
- Billing Cycle: ${invoice.billingInterval}
------------------------------------------------------------------------
Base Taxable Subtotal:                           $${invoice.amount.toFixed(2)}
Tax (18% Integrated GST):                        $${invoice.taxAmount.toFixed(2)}
Coupons / Discounts applied:                     $0.00
------------------------------------------------------------------------
TOTAL PAID AMOUNT:                               $${invoice.totalAmount.toFixed(2)} ${invoice.currency.toUpperCase()}
------------------------------------------------------------------------

Payment Provider Ref:  ${paymentRecord.provider.toUpperCase()} (Ref: ${paymentRecord.orderId})
This document is programmatically issued and verified. No physical signature is required.

Thank you for your business! 🚀
========================================================================
`;

    // 3. Save text file to public invoices path
    const fileName = `${invoice.invoiceNumber}.txt`;
    const invoiceFilePath = path.join(this.invoicesDir, fileName);
    fs.writeFileSync(invoiceFilePath, invoiceText);

    // 4. Update fileUrl in Mongoose
    invoice.fileUrl = `/api/billing/invoice/download/${invoice.invoiceNumber}`;
    await invoice.save();

    console.log(`[INVOICING] Generated sequential tax Invoice document: ${invoice.invoiceNumber} saved locally.`);
    return invoice;
  }

  /**
   * Delete invoice file from server disk
   */
  async deleteInvoiceFile(invoiceNumber) {
    const filePath = path.join(this.invoicesDir, `${invoiceNumber}.txt`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;
