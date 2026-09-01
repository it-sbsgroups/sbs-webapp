import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ApiKeysService } from '../api-keys/api-keys.service';

export interface BrochureExtractionResult {
  name?: string;
  modelNumber?: string;
  description?: string;
  keyFeatures?: string[];
  specifications?: { key: string; value: string }[];
}

// Mimetypes Gemini can read directly. Word/Excel brochures aren't supported —
// the caller should tell the admin to fill those in manually.
const SUPPORTED_MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const EXTRACTION_PROMPT = `You are reading a product brochure/catalogue sheet for an industrial hardware distributor.
Extract only what is explicitly present in the document — never invent or guess values.
Return STRICT JSON with this exact shape and nothing else (no markdown, no commentary):
{
  "name": string | null,
  "modelNumber": string | null,
  "description": string | null,
  "keyFeatures": string[],
  "specifications": [{ "key": string, "value": string }]
}
If a field isn't clearly present in the document, use null (or an empty array for lists). Keep "description" under 80 words.`;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(private readonly apiKeys: ApiKeysService) {}

  isSupportedFormat(format: string): boolean {
    return !!SUPPORTED_MIME_TYPES[(format || '').toLowerCase().replace(/^\./, '')];
  }

  async extractProductDataFromFile(
    fileBuffer: Buffer,
    format: string,
  ): Promise<BrochureExtractionResult> {
    const mimeType = SUPPORTED_MIME_TYPES[(format || '').toLowerCase().replace(/^\./, '')];
    if (!mimeType) {
      throw new BadRequestException(
        'Auto-fill only works on PDF or image brochures (JPG/PNG/WebP). This brochure is a different format — please fill the details in manually.',
      );
    }

    const apiKey = await this.apiKeys.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Gemini API key is not configured. Add it under Admin → Site Settings → API Keys to enable auto-fill from brochures.',
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: EXTRACTION_PROMPT },
              { inlineData: { mimeType, data: fileBuffer.toString('base64') } },
            ],
          },
        ],
        config: { responseMimeType: 'application/json' },
      });
    } catch (err) {
      this.logger.error('Gemini extraction request failed:', err as Error);
      throw new ServiceUnavailableException(
        'Could not reach Gemini right now. Please try again in a moment.',
      );
    }

    const text: string = response?.text ?? '';
    const cleaned = text.replace(/^```json\s*|\s*```$/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        name: parsed.name || undefined,
        modelNumber: parsed.modelNumber || undefined,
        description: parsed.description || undefined,
        keyFeatures: Array.isArray(parsed.keyFeatures) ? parsed.keyFeatures.filter(Boolean) : [],
        specifications: Array.isArray(parsed.specifications)
          ? parsed.specifications.filter((s: any) => s?.key && s?.value)
          : [],
      };
    } catch (err) {
      this.logger.error('Gemini returned non-JSON output:', text);
      throw new ServiceUnavailableException(
        'Gemini returned an unexpected response. Please try again or fill the details in manually.',
      );
    }
  }
}
