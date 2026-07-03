// =============================================================================
// FILE: src/ai/ai.controller.ts  (FULL REPLACEMENT)
// Same as the previous version but ConfigService replaced with ApiKeysService
// for the Gemini API key so it follows the DB → .env → hardcode fallback chain.
// =============================================================================

import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { ProductsService } from '../products/products.service';
import { NewsService } from '../news/news.service';
import { RfqService } from '../rfq/rfq.service';
import { BrandsService } from '../brands/brands.service';
import { SubscribersService } from '../subscribers/subscribers.service';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../prisma/prisma.service';

interface ChatMessage { role: 'user' | 'model'; content: string; }
interface ChatRequest { messages: ChatMessage[]; siteContext?: string; }

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'search_products',
        description: 'Search the live product catalog by keyword, category name, or brand name. Use whenever the user asks about products, parts, availability, or pricing categories.',
        parameters: { type: 'OBJECT', properties: { query: { type: 'STRING', description: 'Search keyword, e.g. "bearing", "6204", "SKF"' } }, required: ['query'] },
      },
      {
        name: 'get_product_detail',
        description: 'Get full details (specs, brochure, images, brand, category) for one specific product by its ID. Call search_products first to get the ID.',
        parameters: { type: 'OBJECT', properties: { productId: { type: 'STRING', description: 'The product ID returned from search_products' } }, required: ['productId'] },
      },
      {
        name: 'list_categories',
        description: 'List all product categories and their subcategories.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'search_news',
        description: 'Search published news/blog posts by keyword.',
        parameters: { type: 'OBJECT', properties: { query: { type: 'STRING' } }, required: ['query'] },
      },
      {
        name: 'list_brands',
        description: 'List all brands SBS Groups carries or distributes.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'list_clients',
        description: 'List notable clients SBS Groups has worked with.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'subscribe_newsletter',
        description: 'Subscribe a user to the newsletter. Only call after user explicitly provides email and confirms.',
        parameters: { type: 'OBJECT', properties: { email: { type: 'STRING' }, firstName: { type: 'STRING' } }, required: ['email'] },
      },
      {
        name: 'create_rfq',
        description: 'Submit a Request For Quote. ONLY call after collecting fullName, email, mobile, and at least one item with productId + quantity. Always confirm details with the user BEFORE calling. Never invent a productId.',
        parameters: {
          type: 'OBJECT',
          properties: {
            fullName:    { type: 'STRING' },
            companyName: { type: 'STRING' },
            email:       { type: 'STRING' },
            mobile:      { type: 'STRING' },
            remarks:     { type: 'STRING' },
            items: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: { productId: { type: 'STRING' }, quantity: { type: 'NUMBER' } },
                required: ['productId', 'quantity'],
              },
            },
          },
          required: ['fullName', 'email', 'mobile', 'items'],
        },
      },
    ],
  },
];

const SYSTEM_INSTRUCTION = `You are the SBS Groups AI Assistant — a helpful, professional guide embedded on the SBS Groups B2B industrial supply website.

You have REAL, LIVE access to the company's database through function calls. Always use the provided tools to answer factual questions — never guess or invent product names, IDs, prices, brands, or news. If a tool returns no results, say so honestly.

Core capabilities:
- search_products / get_product_detail — find real products and their specs
- list_categories — show the real category/subcategory tree
- search_news — find real published news and announcements
- list_brands — show real brands carried
- list_clients — show real client portfolio
- subscribe_newsletter — subscribe a user who gives their email
- create_rfq — submit a real Request For Quote end-to-end

RFQ flow (very important):
1. Help the user find the product(s) via search_products.
2. Collect: full name, email, mobile number, company name (optional), quantity.
3. Read the details back to the user and ask them to confirm.
4. Only after explicit confirmation, call create_rfq.
5. After success, tell the user their RFQ was submitted and our team will contact them.

General behavior:
- Keep responses concise — 2 to 5 sentences unless detail is genuinely needed.
- Be warm, professional, and on-brand for an industrial B2B supplier.
- If asked something unrelated to SBS Groups, products, or site navigation, politely redirect.
- Never expose internal IDs, raw database fields, or technical errors to the user.
- If a tool call fails, apologize briefly and suggest the user try again or contact the team directly.`;

@Public()
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  private readonly endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(
    private readonly apiKeys: ApiKeysService,      // ← 3-tier key resolution
    private readonly products: ProductsService,
    private readonly news: NewsService,
    private readonly rfq: RfqService,
    private readonly brands: BrandsService,
    private readonly subscribers: SubscribersService,
    private readonly categories: CategoriesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('chat')
  async chat(@Body() body: ChatRequest): Promise<{ reply: string }> {
    // Resolve Gemini key at request time via 3-tier fallback
    const geminiApiKey = await this.apiKeys.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new HttpException(
        'AI assistant is not configured. Please set GEMINI_API_KEY in Admin → API Keys or in your .env file.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const { messages = [], siteContext } = body;
    if (!messages.some((m) => m.role === 'user')) {
      throw new HttpException('At least one user message is required.', HttpStatus.BAD_REQUEST);
    }

    const trimmed = messages.slice(-20);
    const contents = trimmed.map((m) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const systemExtra = siteContext ? `\n\nThe user is currently on page: ${siteContext}` : '';

    try {
      const reply = await this.runConversation(contents, systemExtra, geminiApiKey);
      return { reply };
    } catch (err) {
      this.logger.error('AI chat error:', err);
      throw new HttpException(
        "I'm having trouble responding right now. Please try again shortly.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async runConversation(
    contents: any[],
    systemExtra: string,
    apiKey: string,
  ): Promise<string> {
    let currentContents = [...contents];

    for (let round = 0; round < 5; round++) {
      const res = await fetch(`${this.endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION + systemExtra }] },
          contents: currentContents,
          tools: TOOLS,
          generationConfig: { temperature: 0.6, topK: 40, topP: 0.95, maxOutputTokens: 512 },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        this.logger.error(`Gemini API error ${res.status}: ${errText}`);
        throw new Error(`Gemini API returned ${res.status}`);
      }

      const data = await res.json();
      const candidate = data?.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];
      const functionCallPart = parts.find((p: any) => p.functionCall);

      if (!functionCallPart) {
        const text = parts.find((p: any) => p.text)?.text;
        return (text ?? "I'm sorry, I couldn't generate a response. Please try again.").trim();
      }

      const { name, args } = functionCallPart.functionCall;
      this.logger.log(`AI tool call: ${name}(${JSON.stringify(args)})`);

      let toolResult: any;
      try {
        toolResult = await this.executeTool(name, args || {});
      } catch (err: any) {
        toolResult = { error: true, message: err.message || 'Tool execution failed' };
      }

      currentContents = [
        ...currentContents,
        { role: 'model',    parts: [{ functionCall: { name, args } }] },
        { role: 'function', parts: [{ functionResponse: { name, response: { result: toolResult } } }] },
      ];
    }

    return "I gathered some information but I'm having trouble finishing my answer. Could you rephrase your question?";
  }

  private async executeTool(name: string, args: Record<string, any>): Promise<any> {
    switch (name) {
      case 'search_products': {
        const result = await this.products.findAll({ search: args.query, pageSize: 8 } as any);
        return (result?.data ?? []).slice(0, 8).map((p: any) => ({
          id: p.id, name: p.name, sku: p.sku,
          category: p.category?.name, brand: p.brand?.name,
        }));
      }

      case 'get_product_detail': {
        const p = await this.products.findOne(args.productId);
        return {
          found: true, id: (p as any).id, name: (p as any).name, sku: (p as any).sku,
          description: (p as any).description,
          category: (p as any).category?.name, brand: (p as any).brand?.name,
          hasBrochure: !!(p as any).brochureUrl,
        };
      }

      case 'list_categories': {
        const cats = await this.categories.findAll();
        return (cats || []).map((c: any) => ({
          name: c.name,
          subcategories: (c.subcategories || []).map((s: any) => s.name),
        }));
      }

      case 'search_news': {
        const result = await this.news.getPosts({ search: args.query, status: 'published', pageSize: 6 });
        return (result?.data ?? []).slice(0, 6).map((n: any) => ({
          title: n.title, slug: n.slug,
          publishedAt: n.publishedAt || n.createdAt,
          category: n.category?.name,
        }));
      }

      case 'list_brands': {
        const items = await this.brands.findAll();
        return (items || []).slice(0, 20).map((b: any) => ({ name: b.name }));
      }

      case 'list_clients': {
        const items = await this.prisma.client.findMany({
          where: { isActive: true }, take: 20,
          select: { companyName: true, industry: true },
          orderBy: { createdAt: 'desc' },
        });
        return items.map((c) => ({ name: c.companyName, industry: c.industry }));
      }

      case 'subscribe_newsletter': {
        await this.subscribers.subscribe({ email: args.email, firstName: args.firstName } as any);
        return { success: true, email: args.email };
      }

      case 'create_rfq': {
        if (!Array.isArray(args.items) || args.items.length === 0) return { success: false, message: 'No items provided.' };
        const rfq = await this.rfq.create({
          fullName:    args.fullName,
          companyName: args.companyName,
          email:       args.email,
          mobile:      args.mobile,
          remarks:     args.remarks,
          items:       args.items.map((i: any) => ({ productId: i.productId, quantity: Number(i.quantity) || 1 })),
        });
        return { success: true, rfqId: rfq?.id };
      }

      default:
        return { error: true, message: `Unknown tool: ${name}` };
    }
  }
}
