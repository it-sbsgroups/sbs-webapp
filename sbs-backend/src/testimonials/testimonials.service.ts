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

  // ---- Passcodes (admin) ----

  async issuePasscode(dto: IssuePasscodeDto) {
    // Retry a few times in the unlikely event of a code collision.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.generateCode(8);
      const exists = await this.prisma.testimonialPasscode.findUnique({
        where: { code },
      });
      if (exists) continue;
      const passcode = await this.prisma.testimonialPasscode.create({
        data: {
          code,
          companyName: dto.companyName,
          email: dto.email,
          expiresAt: new Date(Date.now() + PASSCODE_TTL_MS),
        },
      });

      // Auto-email the code to the client contact (non-blocking).
      if (passcode.email) {
        const base = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
        void this.mail.sendTestimonialPasscode({
          email: passcode.email,
          code: passcode.code,
          companyName: passcode.companyName,
          expiresAt: passcode.expiresAt,
          writeUrl: base ? `${base}/testimonials/write` : undefined,
        });
      }

      return passcode;
    }
    throw new BadRequestException('Could not generate a unique passcode, retry.');
  }

  listPasscodes() {
    return this.prisma.testimonialPasscode.findMany({
      orderBy: { createdAt: 'desc' },
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

    // Create the testimonial (PENDING) and consume the passcode atomically.
    const [testimonial] = await this.prisma.$transaction([
      this.prisma.testimonial.create({
        data: {
          name: dto.name,
          email: dto.email ?? pc.email,
          companyName: pc.companyName,
          designation: dto.designation,
          testimony: dto.testimony,
          status: 'PENDING',
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
    const t = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Testimonial not found');
    return t;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.testimonial.delete({ where: { id } });
    return { success: true };
  }
}
