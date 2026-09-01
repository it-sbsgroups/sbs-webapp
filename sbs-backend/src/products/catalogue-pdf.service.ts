import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CataloguePdfService {
  private readonly logger = new Logger(CataloguePdfService.name);

  constructor(private prisma: PrismaService) {}

  private async fetchImageBuffer(url: string): Promise<Buffer | null> {
    if (!url) return null;
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
      return Buffer.from(res.data);
    } catch {
      return null;
    }
  }

  private truncate(text: string, max: number) {
    const clean = (text || '').replace(/<[^>]*>/g, '').trim();
    return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
  }

  /** Streams the generated catalogue PDF directly to the response. */
  async streamCatalogue(res: any) {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        subcategory: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        certifications: true,
      },
      orderBy: [{ category: { name: 'asc' } }, { subcategory: { name: 'asc' } }, { name: 'asc' }],
    });

    // Group by category -> subcategory
    const grouped = new Map<string, Map<string, typeof products>>();
    for (const p of products) {
      const catName = p.category?.name || 'Uncategorized';
      const subName = p.subcategory?.name || 'General';
      if (!grouped.has(catName)) grouped.set(catName, new Map());
      const subMap = grouped.get(catName)!;
      if (!subMap.has(subName)) subMap.set(subName, [] as any);
      (subMap.get(subName) as any).push(p);
    }

    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="SBS-Groups-Product-Catalogue.pdf"');
    doc.pipe(res);

    // ---- Cover page ----
    doc.fontSize(28).fillColor('#0f172a').text('SBS Groups', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).fillColor('#334155').text('Product Catalogue', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#94a3b8').text(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), { align: 'center' });

    // ---- Category / Subcategory / Product pages ----
    for (const [catName, subMap] of grouped) {
      doc.addPage();
      doc.fontSize(20).fillColor('#0f172a').text(catName, { underline: true });
      doc.moveDown(0.5);

      for (const [subName, items] of subMap) {
        // keep subcategory heading with at least its first product on the same page
        if (doc.y > doc.page.height - 180) doc.addPage();

        doc.fontSize(14).fillColor('#1e3a8a').text(subName);
        doc.moveDown(0.3);

        for (const p of items as any[]) {
          const blockHeight = 100;
          if (doc.y > doc.page.height - doc.page.margins.bottom - blockHeight) {
            doc.addPage();
          }

          const startY = doc.y;
          const imgX = doc.page.margins.left;
          const imgSize = 80;

          // Image
          const imgUrl = p.images?.[0]?.url;
          const buffer = await this.fetchImageBuffer(imgUrl);
          if (buffer) {
            try {
              doc.image(buffer, imgX, startY, { fit: [imgSize, imgSize] });
            } catch {
              doc.rect(imgX, startY, imgSize, imgSize).stroke('#e2e8f0');
            }
          } else {
            doc.rect(imgX, startY, imgSize, imgSize).stroke('#e2e8f0');
          }

          // Text block to the right of the image
          const textX = imgX + imgSize + 16;
          const textWidth = doc.page.width - doc.page.margins.right - textX;

          doc.fontSize(12).fillColor('#0f172a').text(p.name, textX, startY, { width: textWidth});
          if (p.model) {
            doc.fontSize(9).fillColor('#64748b').text(`Model: ${p.model}`, textX, doc.y, { width: textWidth });
          }
          const certs = (p.certifications || []).map((c: any) => c.name).join(', ');
          if (certs) {
            doc.fontSize(9).fillColor('#0369a1').text(`Certifications: ${certs}`, textX, doc.y, { width: textWidth });
          }
          const features = this.truncate(p.keyFeatures || p.description || '', 140);
          if (features) {
            doc.fontSize(9).fillColor('#334155').text(features, textX, doc.y, { width: textWidth });
          }

          const usedHeight = Math.max(doc.y - startY, imgSize);
          doc.y = startY + usedHeight + 14;
        }
        doc.moveDown(0.4);
      }
    }

    // ---- Page numbers ----
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#94a3b8').text(
        `${i + 1} / ${range.count}`,
        0,
        doc.page.height - doc.page.margins.bottom + 10,
        { align: 'center' },
      );
    }

    doc.end();
  }
}
