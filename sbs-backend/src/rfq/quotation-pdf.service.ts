import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import axios from 'axios';

export interface QuotationItem {
  productName: string;
  variantName?: string;
  model?: string;
  brand?: string;
  image?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
}

export interface QuotationData {
  reference: string;
  date: Date;
  customerName: string;
  companyName?: string;
  email?: string;
  mobile?: string;
  items: QuotationItem[];
  subtotal: number;
  overallDiscountPercent: number;
  discountTotal: number;
  grandTotal: number;
  termsAndConditions?: string;
  privacyPolicyText?: string;
  includePrivacyPolicy: boolean;
  logoUrl?: string;
}

const inr = (n: number) =>
  `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

@Injectable()
export class QuotationPdfService {
  private readonly logger = new Logger(QuotationPdfService.name);

  private async fetchImageBuffer(url?: string): Promise<Buffer | null> {
    if (!url) return null;
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
      return Buffer.from(res.data);
    } catch {
      return null;
    }
  }

  /** Builds the quotation PDF and returns it as a Buffer (for email attachment or download). */
  async buildBuffer(data: QuotationData): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
        const chunks: Buffer[] = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        // ---- Header ----
        const logoBuf = await this.fetchImageBuffer(data.logoUrl);
        if (logoBuf) {
          try {
            doc.image(logoBuf, doc.page.margins.left, doc.y, { height: 34 });
          } catch { /* corrupt/unsupported image — skip, text header still renders */ }
        }
        doc.fontSize(20).fillColor('#0f172a').text('SBS GROUPS', doc.page.margins.left, doc.y + (logoBuf ? 6 : 0), { align: 'right', width: pageWidth });
        doc.fontSize(9).fillColor('#64748b').text('Industrial B2B Supply & Engineering Solutions', { align: 'right', width: pageWidth });
        doc.moveDown(1.2);

        doc.fontSize(22).fillColor('#0f172a').text('QUOTATION', doc.page.margins.left);
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#334155');
        doc.text(`Reference: ${data.reference}`);
        doc.text(`Date: ${data.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`);
        doc.moveDown(0.8);

        // ---- Customer block ----
        doc.roundedRect(doc.page.margins.left, doc.y, pageWidth, 66, 6).fillAndStroke('#f8fafc', '#e2e8f0');
        const boxY = doc.y + 10;
        doc.fillColor('#0f172a').fontSize(11).text(data.customerName || 'Customer', doc.page.margins.left + 14, boxY);
        doc.fontSize(9).fillColor('#475569');
        if (data.companyName) doc.text(data.companyName, doc.page.margins.left + 14);
        if (data.email) doc.text(data.email, doc.page.margins.left + 14);
        if (data.mobile) doc.text(data.mobile, doc.page.margins.left + 14);
        doc.y = boxY + 66;
        doc.moveDown(1);

        // ---- Items table ----
        const colX = {
          no: doc.page.margins.left,
          img: doc.page.margins.left + 22,
          item: doc.page.margins.left + 62,
          qty: doc.page.margins.left + 300,
          price: doc.page.margins.left + 345,
          disc: doc.page.margins.left + 415,
          total: doc.page.margins.left + 460,
        };
        const drawTableHeader = () => {
          doc.rect(doc.page.margins.left, doc.y, pageWidth, 22).fill('#0f172a');
          doc.fillColor('#fff').fontSize(9);
          const hy = doc.y - 16;
          doc.text('#', colX.no + 4, hy, { width: 16 });
          doc.text('', colX.img, hy, { width: 34 });
          doc.text('Item', colX.item, hy, { width: 232 });
          doc.text('Qty', colX.qty, hy, { width: 40 });
          doc.text('Unit Price', colX.price, hy, { width: 65 });
          doc.text('Disc.', colX.disc, hy, { width: 40 });
          doc.text('Line Total', colX.total, hy, { width: 75 });
          doc.y += 6;
        };
        drawTableHeader();

        doc.fillColor('#1e293b').fontSize(9);
        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i];
          const detailLines = [item.variantName, item.model ? `Model: ${item.model}` : null, item.brand ? `Brand: ${item.brand}` : null].filter(Boolean);
          const rowHeight = Math.max(40, 22 + detailLines.length * 11);
          if (doc.y > doc.page.height - doc.page.margins.bottom - rowHeight - 100) {
            doc.addPage();
            drawTableHeader();
          }
          const rowY = doc.y + 4;
          if (i % 2 === 1) doc.rect(doc.page.margins.left, doc.y, pageWidth, rowHeight).fill('#f8fafc');
          doc.fillColor('#1e293b');
          doc.text(String(i + 1), colX.no + 4, rowY, { width: 16 });

          const imgBuf = await this.fetchImageBuffer(item.image);
          if (imgBuf) {
            try {
              doc.image(imgBuf, colX.img, rowY, { width: 30, height: 30, fit: [30, 30] });
            } catch { /* corrupt/unsupported image — row still renders without it */ }
          } else {
            doc.roundedRect(colX.img, rowY, 30, 30, 3).fillAndStroke('#f1f5f9', '#e2e8f0');
            doc.fillColor('#1e293b');
          }

          doc.font('Helvetica-Bold').text(item.productName, colX.item, rowY, { width: 232 });
          let detailY = rowY + 11;
          doc.font('Helvetica').fontSize(8).fillColor('#64748b');
          for (const line of detailLines) {
            doc.text(String(line ?? ''), colX.item, detailY, { width: 232 });
            detailY += 11;
          }
          doc.fontSize(9).fillColor('#1e293b');
          doc.font('Helvetica').text(String(item.quantity), colX.qty, rowY, { width: 40 });
          doc.text(inr(item.unitPrice), colX.price, rowY, { width: 65 });
          doc.text(item.discountPercent ? `${item.discountPercent}%` : '—', colX.disc, rowY, { width: 40 });
          doc.font('Helvetica-Bold').text(inr(item.lineTotal), colX.total, rowY, { width: 75 });
          doc.y = rowY + rowHeight - 4;
        }

        doc.moveDown(0.5);
        doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + pageWidth, doc.y).strokeColor('#e2e8f0').stroke();
        doc.moveDown(0.5);

        // ---- Totals ----
        const totalsX = doc.page.margins.left + pageWidth - 220;
        doc.fontSize(9).fillColor('#475569');
        doc.text('Subtotal:', totalsX, doc.y, { width: 130, continued: false });
        doc.text(inr(data.subtotal), totalsX + 130, doc.y - doc.currentLineHeight(), { width: 90, align: 'right' });
        if (data.overallDiscountPercent) {
          doc.text(`Overall Discount (${data.overallDiscountPercent}%):`, totalsX, doc.y, { width: 130 });
          doc.text(`- ${inr(data.discountTotal)}`, totalsX + 130, doc.y - doc.currentLineHeight(), { width: 90, align: 'right' });
        }
        doc.moveDown(0.3);
        doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold');
        doc.text('Grand Total:', totalsX, doc.y, { width: 130 });
        doc.text(inr(data.grandTotal), totalsX + 130, doc.y - doc.currentLineHeight(), { width: 90, align: 'right' });
        doc.font('Helvetica');
        doc.moveDown(1.5);

        // ---- Terms & Conditions ----
        if (data.termsAndConditions?.trim()) {
          if (doc.y > doc.page.height - 160) doc.addPage();
          doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text('Terms & Conditions');
          doc.font('Helvetica').fontSize(8.5).fillColor('#475569').text(data.termsAndConditions, { width: pageWidth, lineGap: 2 });
          doc.moveDown(1);
        }

        // ---- Privacy policy ----
        if (data.includePrivacyPolicy && data.privacyPolicyText?.trim()) {
          if (doc.y > doc.page.height - 140) doc.addPage();
          doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text('Privacy Policy');
          doc.font('Helvetica').fontSize(8.5).fillColor('#475569').text(data.privacyPolicyText, { width: pageWidth, lineGap: 2 });
        }

        // ---- Footer + "Digitally Approved" stamp on every page ----
        const range = doc.bufferedPageRange();
        for (let p = range.start; p < range.start + range.count; p++) {
          doc.switchToPage(p);

          // Stamp — top-right corner, every page
          const stampText = 'DIGITALLY APPROVED';
          doc.save();
          doc.font('Helvetica-Bold').fontSize(8);
          const stampWidth = doc.widthOfString(stampText) + 20;
          const stampX = doc.page.width - doc.page.margins.right - stampWidth;
          const stampY = doc.page.margins.top - 24 > 0 ? doc.page.margins.top - 24 : 10;
          doc.roundedRect(stampX, stampY, stampWidth, 16, 3).lineWidth(1).strokeColor('#16a34a').stroke();
          doc.fillColor('#16a34a').text(`✓ ${stampText}`, stampX, stampY + 4, { width: stampWidth, align: 'center' });
          doc.restore();

          doc.fontSize(8).fillColor('#94a3b8').text(
            `SBS Groups · Generated ${new Date().toLocaleDateString('en-GB')} · This is a computer-generated quotation.`,
            doc.page.margins.left,
            doc.page.height - doc.page.margins.bottom + 10,
            { width: pageWidth, align: 'center' },
          );
        }

        doc.end();
      } catch (err) {
        this.logger.error('Quotation PDF generation failed:', err as Error);
        reject(err);
      }
    });
  }
}
