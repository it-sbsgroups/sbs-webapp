/*
  Warnings:

  - You are about to drop the column `address` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `contactPerson` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `employeeCount` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `foundedYear` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `gstin` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `pan` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `pincode` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNo` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `aadhar` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `bank_account` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `branch_name` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `facebook` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `father_name` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `ifsc` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `landmark` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `youtube` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `zip_code` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `adsEnabled` on the `news_settings` table. All the data in the column will be lost.
  - You are about to drop the column `adsMaxProducts` on the `news_settings` table. All the data in the column will be lost.
  - You are about to drop the column `adsPlacement` on the `news_settings` table. All the data in the column will be lost.
  - You are about to drop the column `productSuggestionMode` on the `news_settings` table. All the data in the column will be lost.
  - You are about to drop the column `selectedProductIds` on the `news_settings` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `subcategories` table. All the data in the column will be lost.
  - You are about to drop the `ad_placements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news_ad_products` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[unsubscribeToken]` on the table `newsletterSubscriber` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reference]` on the table `rfq_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `ad_placements` DROP FOREIGN KEY `ad_placements_productId_fkey`;

-- DropForeignKey
ALTER TABLE `news_ad_products` DROP FOREIGN KEY `news_ad_products_postId_fkey`;

-- DropIndex
DROP INDEX `employees_aadhar_key` ON `employees`;

-- AlterTable
ALTER TABLE `brands` DROP COLUMN `address`,
    DROP COLUMN `certifications`,
    DROP COLUMN `city`,
    DROP COLUMN `contactEmail`,
    DROP COLUMN `contactPerson`,
    DROP COLUMN `contactPhone`,
    DROP COLUMN `country`,
    DROP COLUMN `description`,
    DROP COLUMN `employeeCount`,
    DROP COLUMN `foundedYear`,
    DROP COLUMN `gstin`,
    DROP COLUMN `pan`,
    DROP COLUMN `pincode`,
    DROP COLUMN `registrationNo`,
    DROP COLUMN `state`,
    ADD COLUMN `isOwnBrand` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `description`,
    DROP COLUMN `icon`;

-- AlterTable
ALTER TABLE `employees` DROP COLUMN `aadhar`,
    DROP COLUMN `address`,
    DROP COLUMN `bank_account`,
    DROP COLUMN `bank_name`,
    DROP COLUMN `branch_name`,
    DROP COLUMN `city`,
    DROP COLUMN `district`,
    DROP COLUMN `facebook`,
    DROP COLUMN `father_name`,
    DROP COLUMN `ifsc`,
    DROP COLUMN `instagram`,
    DROP COLUMN `landmark`,
    DROP COLUMN `last_name`,
    DROP COLUMN `linkedin`,
    DROP COLUMN `middle_name`,
    DROP COLUMN `region`,
    DROP COLUMN `role`,
    DROP COLUMN `state`,
    DROP COLUMN `twitter`,
    DROP COLUMN `whatsapp`,
    DROP COLUMN `youtube`,
    DROP COLUMN `zip_code`,
    MODIFY `first_name` VARCHAR(149) NOT NULL;

-- AlterTable
ALTER TABLE `news_settings` DROP COLUMN `adsEnabled`,
    DROP COLUMN `adsMaxProducts`,
    DROP COLUMN `adsPlacement`,
    DROP COLUMN `productSuggestionMode`,
    DROP COLUMN `selectedProductIds`,
    ADD COLUMN `latestNewsCount` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `latestNewsEnabled` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `newslettersubscriber` ADD COLUMN `notifyNews` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `notifyProducts` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `unsubscribeToken` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `brochurePublicId` VARCHAR(191) NULL,
    ADD COLUMN `brochureResourceType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `rfq_requests` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `reference` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `rfq_settings` MODIFY `submitText` VARCHAR(191) NOT NULL DEFAULT '🚀 Dispatch Quotation Slip';

-- AlterTable
ALTER TABLE `subcategories` DROP COLUMN `description`;

-- DropTable
DROP TABLE `ad_placements`;

-- DropTable
DROP TABLE `news_ad_products`;

-- CreateTable
CREATE TABLE `rfq_counters` (
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `count` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_integrations` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `externalApiEnabled` BOOLEAN NOT NULL DEFAULT false,
    `externalApiUrl` TEXT NULL,
    `externalApiKey` TEXT NULL,
    `externalApiSecret` TEXT NULL,
    `sheetEnabled` BOOLEAN NOT NULL DEFAULT false,
    `sheetId` TEXT NULL,
    `sheetTabName` VARCHAR(191) NOT NULL DEFAULT 'RFQs',
    `googleServiceAccountJson` LONGTEXT NULL,
    `inboundWebhookEnabled` BOOLEAN NOT NULL DEFAULT false,
    `inboundWebhookSecret` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scheduled_notifications` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `targetIds` JSON NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `sentAt` DATETIME(3) NULL,
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carousel_slides` (
    `id` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `nextSlideIn` INTEGER NOT NULL DEFAULT 5,
    `mediaType` VARCHAR(191) NOT NULL DEFAULT 'IMAGE',
    `mediaUrl` TEXT NULL,
    `videoLoop` BOOLEAN NOT NULL DEFAULT false,
    `videoSound` BOOLEAN NOT NULL DEFAULT false,
    `solidColor` VARCHAR(191) NULL,
    `layoutType` VARCHAR(191) NOT NULL DEFAULT 'LEFT',
    `badge` TEXT NULL,
    `title` TEXT NULL,
    `description` LONGTEXT NULL,
    `ctaText` VARCHAR(191) NULL,
    `ctaLink` TEXT NULL,
    `ctaOpenInNewTab` BOOLEAN NOT NULL DEFAULT false,
    `styles` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `carousel_slides_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carousel_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `prevButton` BOOLEAN NOT NULL DEFAULT true,
    `nextButton` BOOLEAN NOT NULL DEFAULT true,
    `bottomDots` BOOLEAN NOT NULL DEFAULT true,
    `autoplay` BOOLEAN NOT NULL DEFAULT true,
    `carouselHeight` VARCHAR(191) NOT NULL DEFAULT '650px',
    `overlayOpacity` DOUBLE NOT NULL DEFAULT 0.55,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `contactName` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `companyAddress` TEXT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `logo` TEXT NULL,
    `website` TEXT NULL,
    `gallery` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clients_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonials` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NULL,
    `testimony` LONGTEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'REWRITE') NOT NULL DEFAULT 'PENDING',
    `sourceType` ENUM('CLIENT', 'BRAND') NOT NULL DEFAULT 'CLIENT',
    `clientId` VARCHAR(191) NULL,
    `brandId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `testimonials_status_idx`(`status`),
    INDEX `testimonials_clientId_idx`(`clientId`),
    INDEX `testimonials_brandId_idx`(`brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonial_passcodes` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `sourceType` ENUM('CLIENT', 'BRAND') NOT NULL DEFAULT 'CLIENT',
    `companyName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NULL,
    `brandId` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `testimonial_passcodes_code_key`(`code`),
    INDEX `testimonial_passcodes_clientId_idx`(`clientId`),
    INDEX `testimonial_passcodes_brandId_idx`(`brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_configs` (
    `key` VARCHAR(191) NOT NULL,
    `data` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faqs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `question` TEXT NOT NULL,
    `answer` LONGTEXT NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `isListedOnFaqPage` BOOLEAN NOT NULL DEFAULT false,
    `isFeaturedInComponent` BOOLEAN NOT NULL DEFAULT false,
    `isAdminCreated` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `faqs_isApproved_deletedAt_idx`(`isApproved`, `deletedAt`),
    INDEX `faqs_isListedOnFaqPage_deletedAt_idx`(`isListedOnFaqPage`, `deletedAt`),
    INDEX `faqs_isFeaturedInComponent_deletedAt_idx`(`isFeaturedInComponent`, `deletedAt`),
    INDEX `faqs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `companyName` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `responded` BOOLEAN NOT NULL DEFAULT false,
    `adminNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `contacts_email_idx`(`email`),
    INDEX `contacts_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_responses` (
    `id` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `emailBody` TEXT NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sentFrom` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(500) NULL,
    `receivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `contact_responses_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IndustryInnovation` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `image` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IndustryInnovationKey` (
    `id` VARCHAR(191) NOT NULL,
    `innovationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhyChooseUs` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhyChooseUsKey` (
    `id` VARCHAR(191) NOT NULL,
    `WhyChooseUsId` VARCHAR(191) NOT NULL,
    `icon` TEXT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ourPrinciple` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `titleimage` TEXT NOT NULL,
    `descriptionimage` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthoriedNetwork` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionName` VARCHAR(191) NOT NULL,
    `heading` VARCHAR(191) NOT NULL,
    `subHeading` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `imageUrls` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `sectionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `newsletterSubscriber_unsubscribeToken_key` ON `newsletterSubscriber`(`unsubscribeToken`);

-- CreateIndex
CREATE UNIQUE INDEX `rfq_requests_reference_key` ON `rfq_requests`(`reference`);

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonial_passcodes` ADD CONSTRAINT `testimonial_passcodes_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonial_passcodes` ADD CONSTRAINT `testimonial_passcodes_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_responses` ADD CONSTRAINT `contact_responses_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IndustryInnovationKey` ADD CONSTRAINT `IndustryInnovationKey_innovationId_fkey` FOREIGN KEY (`innovationId`) REFERENCES `IndustryInnovation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhyChooseUsKey` ADD CONSTRAINT `WhyChooseUsKey_WhyChooseUsId_fkey` FOREIGN KEY (`WhyChooseUsId`) REFERENCES `WhyChooseUs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `PageSection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
