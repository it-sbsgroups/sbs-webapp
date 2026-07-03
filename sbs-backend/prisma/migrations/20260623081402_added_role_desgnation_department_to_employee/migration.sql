-- AlterTable
ALTER TABLE `employees` ADD COLUMN `department` VARCHAR(100) NULL,
    ADD COLUMN `designation` VARCHAR(100) NULL,
    ADD COLUMN `role` VARCHAR(50) NOT NULL DEFAULT 'employee';

-- AlterTable
ALTER TABLE `rfq_settings` MODIFY `submitText` VARCHAR(191) NOT NULL DEFAULT '🚀 Dispatch Quotation Slip';
