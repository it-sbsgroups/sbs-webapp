// =============================================================================
// FILE: src/api-keys/api-keys.service.ts
//
// Centralized credential resolver. Resolution order for every key:
//   1) Site Config DB  — admin panel "API Keys" tab (PUT /site-config/apiKeys)
//   2) process.env     — your .env file
//   3) Hardcoded value — last resort, same values as the current .env
//
// PrismaService is injected directly (@Global) instead of SiteConfigService to
// avoid a circular dependency:  ApiKeysModule → SiteConfigModule → ApiKeysModule
//
// Results are cached for 10 s so DB is not hit on every request.
// Call invalidate() right after an admin saves new keys for instant effect.
// =============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

// ─── Last-resort values (same as current .env — change these when rotating) ──
const HARDCODED_FALLBACKS: Record<string, string> = {
  CLOUDINARY_CLOUD_NAME:    'dhrnoojwo',
  CLOUDINARY_API_KEY:       '481111312761461',
  CLOUDINARY_API_SECRET:    'MI9sYpGRaqGhG68Qx_ZmPEKYMUA',
  GEMINI_API_KEY:           'AQ.Ab8RN6LSfD333C5dJpwwSWVqTVWjijA4Z0ZkSPvKd9B9NXYQaA',
  JWT_SECRET:               'afaf725722ce14ac3c99755e5bad0de2b0e46538c2b2795d1e838d26a3d99623b33705a1d88725cbb63b6c1baa31e131',
  WHATSAPP_ACCESS_TOKEN:    '',
  WHATSAPP_PHONE_NUMBER_ID: '',
  ERP_API_KEY:              '',
  ERP_API_SECRET:           '',
};

// Maps env key name → path inside the `apiKeys` site-config JSON blob:
//   { cloudinary:{cloudName,apiKey,apiSecret}, gemini:{apiKey},
//     jwt:{secret}, erp:{apiKey,apiSecret}, whatsapp:{accessToken,phoneNumberId} }
const SITE_CONFIG_PATH: Record<string, [string, string]> = {
  CLOUDINARY_CLOUD_NAME:    ['cloudinary', 'cloudName'],
  CLOUDINARY_API_KEY:       ['cloudinary', 'apiKey'],
  CLOUDINARY_API_SECRET:    ['cloudinary', 'apiSecret'],
  GEMINI_API_KEY:           ['gemini',     'apiKey'],
  JWT_SECRET:               ['jwt',        'secret'],
  ERP_API_KEY:              ['erp',        'apiKey'],
  ERP_API_SECRET:           ['erp',        'apiSecret'],
  WHATSAPP_ACCESS_TOKEN:    ['whatsapp',   'accessToken'],
  WHATSAPP_PHONE_NUMBER_ID: ['whatsapp',   'phoneNumberId'],
};

const CACHE_TTL_MS = 10_000; // 10 s — admin changes apply within one TTL cycle

interface CacheEntry { value: string; expiresAt: number; }

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Resolve a single credential key via the 3-tier fallback chain.
   * Example:  const key = await this.apiKeys.get('GEMINI_API_KEY');
   */
  async get(name: string): Promise<string> {
    const cached = this.cache.get(name);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const value = await this.resolve(name);
    this.cache.set(name, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  }

  /**
   * Resolve several keys at once.
   * Example:  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY } = await this.apiKeys.getMany([...])
   */
  async getMany(names: string[]): Promise<Record<string, string>> {
    const pairs = await Promise.all(
      names.map(async (n) => [n, await this.get(n)] as const),
    );
    return Object.fromEntries(pairs);
  }

  /**
   * Immediately clear cached value(s) so the next get() re-reads from the DB.
   * Called automatically by SiteConfigController when admin saves apiKeys.
   *
   * @param name  — specific key to clear; omit to clear all cached keys.
   */
  invalidate(name?: string): void {
    if (name) this.cache.delete(name);
    else this.cache.clear();
  }

  // ===========================================================================
  // PRIVATE — 3-tier resolution
  // ===========================================================================

  private async resolve(name: string): Promise<string> {
    // Tier 1 ── Site Config DB ─────────────────────────────────────────────
    const path = SITE_CONFIG_PATH[name];
    if (path) {
      try {
        const row = await this.prisma.siteConfig.findUnique({
          where: { key: 'apiKeys' },
        });
        const blob = row?.data as Record<string, any> | null | undefined;
        const [section, field] = path;
        const fromDb: unknown = blob?.[section]?.[field];
        if (typeof fromDb === 'string' && fromDb.trim() !== '') {
          return fromDb.trim();
        }
      } catch (err) {
        this.logger.warn(
          `Tier-1 read failed for ${name}: ${(err as Error).message}`,
        );
      }
    }

    // Tier 2 ── .env / process.env ─────────────────────────────────────────
    const fromEnv = this.config.get<string>(name);
    if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
      return fromEnv.trim();
    }

    // Tier 3 ── hardcoded fallback ─────────────────────────────────────────
    const fallback = HARDCODED_FALLBACKS[name] ?? '';
    if (fallback !== '') {
      this.logger.warn(
        `${name}: not found in Site Config DB or .env — using hardcoded fallback. ` +
          `Set it in Admin → API Keys or .env to remove this warning.`,
      );
      return fallback;
    }

    this.logger.error(
      `${name}: not set in Site Config, .env, or hardcoded fallbacks. ` +
        `Dependent features will fail until it is configured.`,
    );
    return '';
  }
}
