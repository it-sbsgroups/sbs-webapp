-- AlterTable
ALTER TABLE `rfq_settings` MODIFY `submitText` VARCHAR(191) NOT NULL DEFAULT '🚀 Dispatch Quotation Slip';

-- CreateTable
CREATE TABLE `newsletterSubscriber` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(50) NULL,
    `middleName` VARCHAR(50) NULL,
    `lastName` VARCHAR(50) NULL,
    `email` VARCHAR(250) NOT NULL,
    `mobile` VARCHAR(13) NULL,
    `whatsapp` VARCHAR(13) NULL,
    `subscribed` BOOLEAN NOT NULL DEFAULT true,
    `unsubscribedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `newsletterSubscriber_email_key`(`email`),
    UNIQUE INDEX `newsletterSubscriber_mobile_key`(`mobile`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
