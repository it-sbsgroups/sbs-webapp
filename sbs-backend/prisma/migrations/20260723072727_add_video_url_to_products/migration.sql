-- AlterTable
ALTER TABLE `products` ADD COLUMN `videoURL` TEXT NULL;

-- AlterTable
ALTER TABLE `rfq_settings` MODIFY `submitText` VARCHAR(191) NOT NULL DEFAULT '🚀 Dispatch Quotation Slip';
