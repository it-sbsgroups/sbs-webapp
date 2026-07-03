/*
  Warnings:

  - You are about to alter the column `angle` on the `product_images` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `ad_placements` MODIFY `image` TEXT NULL;

-- AlterTable
ALTER TABLE `api_keys` MODIFY `key` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `brands` MODIFY `logo` TEXT NULL,
    MODIFY `website` TEXT NULL;

-- AlterTable
ALTER TABLE `categories` MODIFY `image` TEXT NULL;

-- AlterTable
ALTER TABLE `product_certifications` MODIFY `name` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `product_images` MODIFY `url` TEXT NOT NULL,
    MODIFY `title` VARCHAR(500) NULL,
    MODIFY `angle` VARCHAR(100) NULL,
    MODIFY `altText` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `product_settings` ADD COLUMN `brochureButtonText` VARCHAR(191) NOT NULL DEFAULT 'Download Brochure',
    ADD COLUMN `brochureMode` VARCHAR(191) NOT NULL DEFAULT 'download',
    ADD COLUMN `showBrochureButton` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `brochureFormat` VARCHAR(191) NULL,
    ADD COLUMN `brochureName` VARCHAR(191) NULL,
    ADD COLUMN `brochureSize` INTEGER NULL,
    ADD COLUMN `brochureUrl` TEXT NULL,
    MODIFY `material` TEXT NULL,
    MODIFY `manufacturer` TEXT NULL;

-- AlterTable
ALTER TABLE `rfq_settings` MODIFY `submitText` VARCHAR(191) NOT NULL DEFAULT '🚀 Dispatch Quotation Slip';

-- AlterTable
ALTER TABLE `subcategories` MODIFY `image` TEXT NULL;
