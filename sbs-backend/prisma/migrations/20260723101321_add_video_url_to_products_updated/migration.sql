/*
  Warnings:

  - You are about to drop the column `videoURL` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `videoURL`,
    ADD COLUMN `videoUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `rfq_settings` MODIFY `submitText` VARCHAR(191) NOT NULL DEFAULT '🚀 Dispatch Quotation Slip';
