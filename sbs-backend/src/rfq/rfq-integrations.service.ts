import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ONE-WAY OUTBOUND ONLY.
 * We only ever POST/append data out. Nothing here ever reads the external
 * API or the Google Sheet back into our database — so edits made on either
 * of those sides can never change our project's data.
 */
@Injectable()
export class RfqIntegrationsService {
  private readonly logger = new Logger(RfqIntegrationsService.name);

  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.rfqIntegration.findFirst();
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

    return this.prisma.rfqIntegration.upsert({
      where: { id: 'default' },
      create: { ...clean, id: 'default' },
      update: clean,
    });
  }

  /** Fire-and-forget: call both integrations after an RFQ is created. Never throws. */
  async pushOnRfqCreated(rfq: any) {
    const settings = await this.getSettings();
    await Promise.allSettled([
      settings.externalApiEnabled ? this.forwardToExternalApi(rfq, settings) : Promise.resolve(),
      settings.sheetEnabled ? this.pushToGoogleSheet(rfq, settings) : Promise.resolve(),
    ]);
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
      // one row per line-item, since a single RFQ can cover several products
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

  private async pushToGoogleSheet(rfq: any, settings: any) {
    if (!settings.sheetId || !settings.googleServiceAccountJson) return;
    try {
      const credentials = JSON.parse(settings.googleServiceAccountJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const sheets = google.sheets({ version: 'v4', auth });
      const tab = settings.sheetTabName || 'RFQs';
      const payload = this.buildFlatPayload(rfq);

      // one row per line item (or one row with blanks if no items)
      const items = payload.lineItems.length ? payload.lineItems : [{ productName: '', model: '', quantity: '' }];
      const rows = items.map((it) => [
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
}
