-- AlterTable
ALTER TABLE `rfq_settings` MODIFY `submitText` VARCHAR(191) NOT NULL DEFAULT '🚀 Dispatch Quotation Slip';

-- CreateTable
CREATE TABLE `employees` (
    `id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `middle_name` VARCHAR(50) NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `father_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `mobile` VARCHAR(15) NOT NULL,
    `whatsapp` VARCHAR(15) NULL,
    `linkedin` VARCHAR(255) NULL,
    `instagram` VARCHAR(255) NULL,
    `facebook` VARCHAR(255) NULL,
    `youtube` VARCHAR(255) NULL,
    `twitter` VARCHAR(255) NULL,
    `image` TEXT NULL,
    `region` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `district` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `landmark` VARCHAR(200) NULL,
    `zip_code` VARCHAR(10) NULL,
    `aadhar` VARCHAR(12) NULL,
    `bank_account` VARCHAR(20) NULL,
    `ifsc` VARCHAR(11) NULL,
    `bank_name` VARCHAR(100) NULL,
    `branch_name` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employees_email_key`(`email`),
    UNIQUE INDEX `employees_aadhar_key`(`aadhar`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
