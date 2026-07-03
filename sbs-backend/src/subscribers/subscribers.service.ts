// src/subscribers/subscribers.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { QuerySubscriberDto } from './dto/query-subscriber.dto';
// Note: We don't need to import Prisma namespace types directly
// They're automatically available through PrismaService

@Injectable()
export class SubscribersService {
  private readonly logger = new Logger(SubscribersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * SUBSCRIBE - Add new newsletter subscriber
   */
  async subscribe(createSubscriberDto: CreateSubscriberDto) {
    const { email, firstName, middleName, lastName, mobile, whatsapp } = createSubscriberDto;

    // Check if email already exists
    const existingSubscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      // If already subscribed, prevent duplicate
      if (existingSubscriber.subscribed) {
        throw new ConflictException({
          statusCode: 409,
          message: 'This email is already subscribed to our newsletter',
          error: 'Conflict',
          subscriberId: existingSubscriber.id,
          subscribedAt: existingSubscriber.createdAt,
        });
      }

      // Re-subscribe previously unsubscribed user
      this.logger.log(`Re-subscribing previously unsubscribed user: ${email}`);
      return this.reSubscribe(existingSubscriber.id);
    }

    // Check mobile uniqueness if provided
    if (mobile) {
      const existingMobile = await this.prisma.newsletterSubscriber.findUnique({
        where: { mobile },
      });

      if (existingMobile) {
        throw new ConflictException({
          statusCode: 409,
          message: 'This mobile number is already registered with another subscriber',
          error: 'Conflict',
        });
      }
    }

    // Create new subscriber
    const subscriber = await this.prisma.newsletterSubscriber.create({
      data: {
        firstName: firstName || null,
        middleName: middleName || null,
        lastName: lastName || null,
        email,
        mobile: mobile || null,
        whatsapp: whatsapp || null,
        subscribed: true,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        mobile: true,
        whatsapp: true,
        subscribed: true,
        createdAt: true,
        updatedAt: true,
        unsubscribedAt: true,
      },
    });

    this.logger.log(`New subscriber added: ${email}`);

    return {
      success: true,
      message: 'Successfully subscribed to our newsletter',
      data: subscriber,
    };
  }

  /**
   * FIND ALL - Get subscribers with filtering, search, and pagination
   */
  async findAll(query: QuerySubscriberDto) {
    const {
      subscribed,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause dynamically
    // Use 'any' type to avoid Prisma type complexity
    const where: any = {};

    if (subscribed !== undefined) {
      where.subscribed = subscribed;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { middleName: { contains: search } },
      ];
    }

    // Build orderBy
    // Whitelist allowed sort fields for security
    const allowedSortFields = [
      'id',
      'firstName',
      'lastName',
      'email',
      'createdAt',
      'updatedAt',
      'unsubscribedAt',
    ];

    let orderBy: any;
    if (allowedSortFields.includes(sortBy)) {
      orderBy = { [sortBy]: sortOrder };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    // Execute queries in parallel
    const [subscribers, total, subscribedCount, unsubscribedCount] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          mobile: true,
          whatsapp: true,
          subscribed: true,
          unsubscribedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.newsletterSubscriber.count({ where }),
      this.prisma.newsletterSubscriber.count({
        where: { ...where, subscribed: true },
      }),
      this.prisma.newsletterSubscriber.count({
        where: { ...where, subscribed: false },
      }),
    ]);

    return {
      success: true,
      data: subscribers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        subscribedCount,
        unsubscribedCount,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * FIND ONE - Get subscriber by ID
   */
  async findOne(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        mobile: true,
        whatsapp: true,
        subscribed: true,
        unsubscribedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!subscriber) {
      throw new NotFoundException({
        statusCode: 404,
        message: `Subscriber with ID '${id}' not found`,
        error: 'Not Found',
      });
    }

    return {
      success: true,
      data: subscriber,
    };
  }

  /**
   * FIND BY EMAIL - Get subscriber by email
   */
  async findByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        mobile: true,
        whatsapp: true,
        subscribed: true,
        unsubscribedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!subscriber) {
      throw new NotFoundException({
        statusCode: 404,
        message: `Subscriber with email '${email}' not found`,
        error: 'Not Found',
      });
    }

    return {
      success: true,
      data: subscriber,
    };
  }

  /**
   * UPDATE - Update subscriber information
   */
  async update(id: string, updateSubscriberDto: UpdateSubscriberDto) {
    // Verify subscriber exists
    const existing = await this.findOne(id);
    const subscriber = existing.data;

    // Prepare update data (only provided fields)
    const updateData: any = {};

    // Handle name fields
    if (updateSubscriberDto.firstName !== undefined) {
      updateData.firstName = updateSubscriberDto.firstName || null;
    }
    if (updateSubscriberDto.middleName !== undefined) {
      updateData.middleName = updateSubscriberDto.middleName || null;
    }
    if (updateSubscriberDto.lastName !== undefined) {
      updateData.lastName = updateSubscriberDto.lastName || null;
    }

    // Handle mobile with uniqueness check
    if (updateSubscriberDto.mobile !== undefined) {
      if (updateSubscriberDto.mobile && updateSubscriberDto.mobile !== subscriber.mobile) {
        const mobileExists = await this.prisma.newsletterSubscriber.findUnique({
          where: { mobile: updateSubscriberDto.mobile },
        });
        if (mobileExists && mobileExists.id !== id) {
          throw new ConflictException({
            statusCode: 409,
            message: 'This mobile number is already registered to another subscriber',
            error: 'Conflict',
          });
        }
      }
      updateData.mobile = updateSubscriberDto.mobile || null;
    }

    // Handle whatsapp
    if (updateSubscriberDto.whatsapp !== undefined) {
      updateData.whatsapp = updateSubscriberDto.whatsapp || null;
    }

    // Handle subscription status
    if (updateSubscriberDto.subscribed !== undefined) {
      if (updateSubscriberDto.subscribed) {
        updateData.subscribed = true;
        updateData.unsubscribedAt = null;
      } else {
        updateData.subscribed = false;
        updateData.unsubscribedAt = new Date();
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'No valid fields provided for update',
        error: 'Bad Request',
      });
    }

    // Perform update
    const updated = await this.prisma.newsletterSubscriber.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        mobile: true,
        whatsapp: true,
        subscribed: true,
        unsubscribedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Subscriber ${id} updated successfully`);

    return {
      success: true,
      message: 'Subscriber updated successfully',
      data: updated,
    };
  }

  /**
   * RE-SUBSCRIBE - Reactivate unsubscribed user
   */
  async reSubscribe(id: string) {
    const existing = await this.findOne(id);
    const subscriber = existing.data;

    if (subscriber.subscribed) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'This user is already subscribed to the newsletter',
        error: 'Bad Request',
      });
    }

    const updated = await this.prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        subscribed: true,
        unsubscribedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        mobile: true,
        whatsapp: true,
        subscribed: true,
        unsubscribedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User ${id} re-subscribed successfully`);

    return {
      success: true,
      message: 'Successfully re-subscribed to our newsletter',
      data: updated,
    };
  }

  /**
   * UNSUBSCRIBE - Opt out from newsletter
   */
  async unsubscribe(id: string) {
    const existing = await this.findOne(id);
    const subscriber = existing.data;

    if (!subscriber.subscribed) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'This user is already unsubscribed from the newsletter',
        error: 'Bad Request',
      });
    }

    const updated = await this.prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        subscribed: false,
        unsubscribedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        subscribed: true,
        unsubscribedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User ${id} (${updated.email}) unsubscribed`);

    return {
      success: true,
      message: 'Successfully unsubscribed from our newsletter',
      data: updated,
    };
  }

  /**
   * UNSUBSCRIBE BY EMAIL - For email unsubscribe links
   */
  async unsubscribeByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (!subscriber || !subscriber.subscribed) {
      return {
        success: true,
        message: 'If this email was subscribed, it has been unsubscribed',
      };
    }

    await this.prisma.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: {
        subscribed: false,
        unsubscribedAt: new Date(),
      },
    });

    this.logger.log(`User unsubscribed via email: ${normalizedEmail}`);

    return {
      success: true,
      message: 'Successfully unsubscribed from our newsletter',
    };
  }

  /**
   * REMOVE - Delete subscriber permanently
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.newsletterSubscriber.delete({
      where: { id },
    });

    this.logger.log(`Subscriber ${id} permanently deleted`);

    return {
      success: true,
      message: 'Subscriber permanently deleted',
    };
  }

  /**
   * REMOVE MANY - Bulk delete subscribers
   */
  async removeMany(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'No subscriber IDs provided for deletion',
        error: 'Bad Request',
      });
    }

    const result = await this.prisma.newsletterSubscriber.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    this.logger.log(`Bulk deleted ${result.count} subscribers`);

    return {
      success: true,
      message: `${result.count} subscriber(s) deleted successfully`,
      data: {
        deletedCount: result.count,
      },
    };
  }

  /**
   * GET STATISTICS - Dashboard analytics
   */
  async getStatistics() {
    const [
      total,
      active,
      inactive,
      lastWeekNew,
      lastMonthNew,
      lastWeekUnsubscribed,
    ] = await Promise.all([
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({
        where: { subscribed: true },
      }),
      this.prisma.newsletterSubscriber.count({
        where: { subscribed: false },
      }),
      this.prisma.newsletterSubscriber.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.newsletterSubscriber.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.newsletterSubscriber.count({
        where: {
          unsubscribedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        active,
        inactive,
        activeRate: total > 0
          ? ((active / total) * 100).toFixed(1) + '%'
          : '0%',
        lastWeekNew,
        lastMonthNew,
        lastWeekUnsubscribed,
        netGrowthThisWeek: lastWeekNew - lastWeekUnsubscribed,
      },
    };
  }
}