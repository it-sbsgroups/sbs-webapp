import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  IssuePasscodeDto,
  SubmitTestimonialDto,
} from './dto/testimonial.dto';

const PASSCODE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
// Unambiguous alphabet (no 0/O/1/I/L) for codes that get read & typed.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

type SourceType = 'CLIENT' | 'BRAND';

interface IssueOptions {
  sourceType: SourceType;
  companyName: string;
  email?: string | null;
  clientId?: string;
  brandId?: string;
}

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  private generateCode(len = 8) {
    const bytes = randomBytes(len);
    let code = '';
    for (let i = 0; i < len; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
    return code;
  }

  // ---- Shared passcode issuance ----

  /** Core issuance logic shared by manual issuance and client/brand requests. */
  private async issuePasscodeInternal(opts: IssueOptions) {
    if (!opts.email) {
      throw new BadRequestException(
        'An email address is required to send a testimonial request.',
      );
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.generateCode(8);
      const exists = await this.prisma.testimonialPasscode.findUnique({
        where: { code },
      });
      if (exists) continue;

      const passcode = await this.prisma.testimonialPasscode.create({
        data: {
          code,
          sourceType: opts.sourceType,
          companyName: opts.companyName,
          email: opts.email,
          clientId: opts.clientId,
          brandId: opts.brandId,
          expiresAt: new Date(Date.now() + PASSCODE_TTL_MS),
        },
      });

      const base = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
      void this.mail.sendTestimonialPasscode({
        email: passcode.email!,
        code: passcode.code,
        companyName: passcode.companyName,
        expiresAt: passcode.expiresAt,
        writeUrl: base ? `${base}/testimonials/write` : undefined,
      });

      return passcode;
    }
    throw new BadRequestException('Could not generate a unique passcode, retry.');
  }

  /** Admin manually types a company name/email (no existing Client/Brand record). */
  issuePasscode(dto: IssuePasscodeDto) {
    return this.issuePasscodeInternal({
      sourceType: 'CLIENT',
      companyName: dto.companyName,
      email: dto.email,
    });
  }

  /** Send a testimonial request to an existing Client, using their record's email. */
  async requestForClient(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException('Client not found');

    return this.issuePasscodeInternal({
      sourceType: 'CLIENT',
      companyName: client.companyName,
      email: client.email,
      clientId: client.id,
    });
  }

  /**
   * Send a testimonial request to an existing partner Brand, using their
   * record's email. Blocked for brands flagged as our own (isOwnBrand=true) —
   * we don't ask ourselves for a testimonial.
   */
  async requestForBrand(brandId: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });
    if (!brand) throw new NotFoundException('Brand not found');

    if (brand.isOwnBrand) {
      throw new BadRequestException(
        'This brand is marked as your own brand — testimonial requests can only be sent to partner/distributor brands.',
      );
    }

    return this.issuePasscodeInternal({
      sourceType: 'BRAND',
      companyName: brand.name,
      email: brand.email,
      brandId: brand.id,
    });
  }

  listPasscodes() {
    return this.prisma.testimonialPasscode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, companyName: true, logo: true } },
        brand: { select: { id: true, name: true, logo: true } },
      },
    });
  }

  async deletePasscode(id: string) {
    const pc = await this.prisma.testimonialPasscode.findUnique({
      where: { id },
    });
    if (!pc) throw new NotFoundException('Passcode not found');
    await this.prisma.testimonialPasscode.delete({ where: { id } });
    return { success: true };
  }

  // ---- Public submission ----

  /** Validate a passcode without consuming it (used by /testimonials/write). */
  async verifyPasscode(code: string) {
    const pc = await this.prisma.testimonialPasscode.findUnique({
      where: { code },
    });
    if (!pc) throw new NotFoundException('Invalid passcode');
    if (pc.usedAt) throw new BadRequestException('This passcode has already been used');
    if (pc.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('This passcode has expired');
    }
    return { valid: true, companyName: pc.companyName, email: pc.email };
  }

  async submit(dto: SubmitTestimonialDto) {
    const pc = await this.prisma.testimonialPasscode.findUnique({
      where: { code: dto.code },
    });
    if (!pc) throw new NotFoundException('Invalid passcode');
    if (pc.usedAt) throw new BadRequestException('This passcode has already been used');
    if (pc.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('This passcode has expired');
    }

    // Create the testimonial (PENDING), carrying over the client/brand
    // binding from the passcode, and consume the passcode atomically.
    const [testimonial] = await this.prisma.$transaction([
      this.prisma.testimonial.create({
        data: {
          name: dto.name,
          email: dto.email ?? pc.email,
          companyName: pc.companyName,
          designation: dto.designation,
          testimony: dto.testimony,
          status: 'PENDING',
          sourceType: pc.sourceType,
          clientId: pc.clientId,
          brandId: pc.brandId,
        },
      }),
      this.prisma.testimonialPasscode.update({
        where: { id: pc.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return {
      success: true,
      message: 'Thank you! Your testimonial has been submitted for review.',
      id: testimonial.id,
    };
  }

  findPublic() {
    return this.prisma.testimonial.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, companyName: true, logo: true, slug: true } },
        brand: { select: { id: true, name: true, logo: true, slug: true } },
      },
    });
  }

  // ---- Admin moderation ----

  findAll(status?: string) {
    const where =
      status && ['PENDING', 'APPROVED', 'REJECTED', 'REWRITE'].includes(status)
        ? { status: status as any }
        : {};
    return this.prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, companyName: true, logo: true } },
        brand: { select: { id: true, name: true, logo: true } },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.testimonial.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async findOne(id: string) {
    const t = await this.prisma.testimonial.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, companyName: true, logo: true } },
        brand: { select: { id: true, name: true, logo: true } },
      },
    });
    if (!t) throw new NotFoundException('Testimonial not found');
    return t;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.testimonial.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Admin-authored testimonial — no passcode flow, no client/brand request.
   * Created straight into APPROVED status since an admin is entering it
   * directly (e.g. from an email, call, or printed letter).
   */
  async createManual(dto: {
    name: string; companyName: string; testimony: string; designation?: string; email?: string;
  }) {
    return this.prisma.testimonial.create({
      data: {
        name: dto.name,
        companyName: dto.companyName,
        testimony: dto.testimony,
        designation: dto.designation,
        email: dto.email,
        status: 'APPROVED',
        sourceType: 'CLIENT',
        // clientId/brandId intentionally left unset — this is a standalone entry.
      },
    });
  }
}
