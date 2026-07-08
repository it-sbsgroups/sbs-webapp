import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

const SHEET_HEADER = [
  'RFQ ID',
  'Date',
  'Name',
  'Email',
  'Mobile',
  'Company',
  'Address',
  'Product',
  'Model',
  'Quantity',
  'Remarks',
];

@Injectable()
export class RfqIntegrationsService {
  private readonly logger = new Logger(RfqIntegrationsService.name);

  constructor(private prisma: PrismaService) {}

  async getSettings() {
    // findUnique by the fixed 'default' id instead of findFirst() (no where/orderBy).
    // findFirst() is non-deterministic if more than one row ever exists (e.g. a stray
    // row inserted before the "id: default" convention was enforced everywhere) and
    // can silently return the wrong settings object.
    const settings = await this.prisma.rfqIntegration.findUnique({ where: { id: 'default' } });
    if (!settings) {
      return this.prisma.rfqIntegration.create({ data: { id: 'default' } });
    }
    return settings;
  }

  async updateSettings(data: any) {
    const clean: any = {};
    if (data.externalApiEnabled !== undefined) clean.externalApiEnabled = !!data.externalApiEnabled;
    if (data.externalApiUrl !== undefined) clean.externalApiUrl = data.externalApiUrl;
    if (data.externalApiKey !== undefined) clean.externalApiKey = data.externalApiKey;
    if (data.externalApiSecret !== undefined) clean.externalApiSecret = data.externalApiSecret;
    if (data.sheetEnabled !== undefined) clean.sheetEnabled = !!data.sheetEnabled;
    if (data.sheetId !== undefined) clean.sheetId = data.sheetId;
    if (data.sheetTabName !== undefined) clean.sheetTabName = data.sheetTabName;
    if (data.googleServiceAccountJson !== undefined) clean.googleServiceAccountJson = data.googleServiceAccountJson;
    // 👇 New fields
    if (data.inboundWebhookEnabled !== undefined) clean.inboundWebhookEnabled = !!data.inboundWebhookEnabled;
    if (data.inboundWebhookSecret !== undefined) clean.inboundWebhookSecret = data.inboundWebhookSecret;

    return this.prisma.rfqIntegration.upsert({
      where: { id: 'default' },
      create: { ...clean, id: 'default' },
      update: clean,
    });
  }

  /** Call both integrations after an RFQ is created. Never throws. */
  async pushOnRfqCreated(rfq: any) {
    const settings = await this.getSettings();

    // Always-on visibility: without this, "external API disabled/no url" and
    // "never entered this function" look identical from the logs.
    this.logger.log(
      `pushOnRfqCreated: rfq=${rfq?.id} externalApiEnabled=${settings.externalApiEnabled} ` +
        `hasUrl=${!!settings.externalApiUrl} sheetEnabled=${settings.sheetEnabled}`,
    );

    const results = await Promise.allSettled([
      settings.externalApiEnabled ? this.forwardToExternalApi(rfq, settings) : Promise.resolve('skipped-disabled'),
      settings.sheetEnabled ? this.pushToGoogleSheet(rfq, settings) : Promise.resolve('skipped-disabled'),
    ]);

    this.logger.log(
      `pushOnRfqCreated done: rfq=${rfq?.id} externalApi=${results[0].status} sheet=${results[1].status}`,
    );
  }

  private buildFlatPayload(rfq: any) {
    const items = rfq.items || [];
    return {
      rfqId: rfq.id,
      name: rfq.fullName,
      email: rfq.email,
      mobile: rfq.mobile,
      company: rfq.companyName || '',
      address: rfq.address || '',
      remarks: rfq.remarks || '',
      createdAt: rfq.createdAt,
      lineItems: items.map((it: any) => ({
        productName: it.product?.name || '',
        model: it.product?.model || '',
        quantity: it.quantity,
      })),
    };
  }

  private async forwardToExternalApi(rfq: any, settings: any) {
    if (!settings.externalApiUrl) return;
    try {
      const payload = this.buildFlatPayload(rfq);
      await axios.post(settings.externalApiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.externalApiKey || '',
          'x-api-secret': settings.externalApiSecret || '',
        },
        timeout: 10000,
      });
      this.logger.log(`RFQ ${rfq.id} forwarded to external API`);
    } catch (e: any) {
      this.logger.error(`External API forward failed for RFQ ${rfq.id}: ${e?.message}`);
    }
  }

  // Add this method to the RfqIntegrationsService class
async testExternalApi(): Promise<{ success: boolean; message: string; statusCode?: number }> {
  const settings = await this.getSettings();
  if (!settings.externalApiEnabled) {
    return { success: false, message: 'External API is disabled in settings.' };
  }
  if (!settings.externalApiUrl) {
    return { success: false, message: 'External API URL is not configured.' };
  }

  const testPayload = {
    test: true,
    message: 'This is a test request from SBS Groups RFQ integration.',
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await axios.post(settings.externalApiUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.externalApiKey || '',
        'x-api-secret': settings.externalApiSecret || '',
      },
      timeout: 10000,
    });
    return {
      success: true,
      message: `Test successful. Status: ${response.status}`,
      statusCode: response.status,
    };
  } catch (error: any) {
    const status = error.response?.status || 500;
    const msg = error.response?.data?.message || error.message || 'Unknown error';
    return {
      success: false,
      message: `Test failed (HTTP ${status}): ${msg}`,
      statusCode: status,
    };
  }
}

  /** Auth + client builder shared by the live push and the full backfill sync. */
  private getSheetsClient(settings: any) {
    const credentials = JSON.parse(settings.googleServiceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
  }

  /** Writes the header row only if row 1 is currently empty. Safe to call every time. */
  private async ensureHeaderRow(sheets: any, sheetId: string, tab: string) {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tab}!A1:K1`,
    });
    const hasHeader = existing.data.values && existing.data.values.length > 0;
    if (!hasHeader) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${tab}!A1:K1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [SHEET_HEADER] },
      });
    }
  }

  private rowsForRfq(rfq: any) {
    const payload = this.buildFlatPayload(rfq);
    const items = payload.lineItems.length ? payload.lineItems : [{ productName: '', model: '', quantity: '' }];
    return items.map((it) => [
      payload.rfqId,
      payload.createdAt,
      payload.name,
      payload.email,
      payload.mobile,
      payload.company,
      payload.address,
      it.productName,
      it.model,
      it.quantity,
      payload.remarks,
    ]);
  }

  private async pushToGoogleSheet(rfq: any, settings: any) {
    if (!settings.sheetId || !settings.googleServiceAccountJson) return;
    try {
      const sheets = this.getSheetsClient(settings);
      const tab = settings.sheetTabName || 'RFQs';

      // One-way, append-only: this NEVER reads the sheet's data back into the app,
      // so edits made directly in the sheet can never change anything on the website.
      await this.ensureHeaderRow(sheets, settings.sheetId, tab);

      const rows = this.rowsForRfq(rfq);
      await sheets.spreadsheets.values.append({
        spreadsheetId: settings.sheetId,
        range: `${tab}!A:K`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: rows },
      });
      this.logger.log(`RFQ ${rfq.id} pushed to Google Sheet (${rows.length} row(s))`);
    } catch (e: any) {
      this.logger.error(`Google Sheet push failed for RFQ ${rfq.id}: ${e?.message}`);
    }
  }

  /**
   * Full backfill: rewrites the sheet so it reflects EVERY RFQ currently in the
   * database, not just ones created after the integration was turned on. Safe to
   * run repeatedly (e.g. from an admin "Sync All" button) — it always clears the
   * data rows first, so re-running never duplicates rows. Strictly one-way: reads
   * from the database and writes to the sheet, never the other direction.
   */
  async syncAllToSheet(): Promise<{ success: boolean; message: string; rowCount?: number }> {
    const settings = await this.getSettings();
    if (!settings.sheetEnabled) {
      return { success: false, message: 'Google Sheet push is disabled in settings.' };
    }
    if (!settings.sheetId || !settings.googleServiceAccountJson) {
      return { success: false, message: 'Sheet ID or service account JSON is not configured.' };
    }

    try {
      const rfqs = await this.prisma.rfqRequest.findMany({
        include: {
          items: {
            include: { product: { select: { name: true, model: true } } },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const sheets = this.getSheetsClient(settings);
      const tab = settings.sheetTabName || 'RFQs';

      const allRows = rfqs.flatMap((rfq) => this.rowsForRfq(rfq));

      // Clear any existing data (everything below the header) before rewriting, so
      // re-running this never produces duplicate rows.
      await sheets.spreadsheets.values.clear({
        spreadsheetId: settings.sheetId,
        range: `${tab}!A2:K`,
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: settings.sheetId,
        range: `${tab}!A1:K1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [SHEET_HEADER] },
      });

      if (allRows.length) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: settings.sheetId,
          range: `${tab}!A2`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: allRows },
        });
      }

      this.logger.log(`Full sheet sync: wrote ${allRows.length} row(s) from ${rfqs.length} RFQ(s)`);
      return { success: true, message: `Synced ${rfqs.length} RFQ(s) (${allRows.length} row(s)) to the sheet.`, rowCount: allRows.length };
    } catch (e: any) {
      this.logger.error(`Full sheet sync failed: ${e?.message}`);
      return { success: false, message: `Sync failed: ${e?.message || 'Unknown error'}` };
    }
  }
}