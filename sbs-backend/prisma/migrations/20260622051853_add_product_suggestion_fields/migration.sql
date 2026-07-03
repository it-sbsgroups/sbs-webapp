-- AlterTable
ALTER TABLE `news_settings` ADD COLUMN `productSuggestionMode` VARCHAR(191) NOT NULL DEFAULT 'latest',
    ADD COLUMN `selectedProductIds` JSON NULL;

-- AlterTable
ALTER TABLE `rfq_settings` MODIFY `submitText` VARCHAR(191) NOT NULL DEFAULT '🚀 Dispatch Quotation Slip';
