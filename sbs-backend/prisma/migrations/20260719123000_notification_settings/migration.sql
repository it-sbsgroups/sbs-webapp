-- Universal notification timing settings (instant vs. once-daily batch,
-- separately for products and news).
CREATE TABLE `notification_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `productsMode` VARCHAR(191) NOT NULL DEFAULT 'INSTANT',
    `productsBatchTime` VARCHAR(191) NOT NULL DEFAULT '18:00',
    `newsMode` VARCHAR(191) NOT NULL DEFAULT 'INSTANT',
    `newsBatchTime` VARCHAR(191) NOT NULL DEFAULT '18:00',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Marks a scheduled_notifications row as the auto-accumulating daily batch
-- row for a type/day, distinct from a one-off admin-scheduled send.
ALTER TABLE `scheduled_notifications`
    ADD COLUMN `isDailyBatch` BOOLEAN NOT NULL DEFAULT false;
