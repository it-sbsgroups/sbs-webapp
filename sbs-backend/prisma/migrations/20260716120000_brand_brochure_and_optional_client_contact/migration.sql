-- AlterTable: add brochure fields to brands (locally-stored file, not Cloudinary)
ALTER TABLE `brands`
    ADD COLUMN `brochureUrl` TEXT NULL,
    ADD COLUMN `brochureName` VARCHAR(191) NULL,
    ADD COLUMN `brochureSize` INTEGER NULL,
    ADD COLUMN `brochureFormat` VARCHAR(191) NULL;

-- AlterTable: contact details are no longer required when adding a client
ALTER TABLE `clients`
    MODIFY `contactName` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL;
