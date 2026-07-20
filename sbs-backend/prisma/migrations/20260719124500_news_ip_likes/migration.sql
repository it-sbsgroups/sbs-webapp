-- Denormalized like count for fast card/list rendering.
ALTER TABLE `news_posts`
    ADD COLUMN `likesCount` INTEGER NOT NULL DEFAULT 0;

-- One row per (post, ip) — the unique index is what actually enforces
-- "one like per IP per article".
CREATE TABLE `news_likes` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `news_likes_postId_ip_key`(`postId`, `ip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `news_likes`
    ADD CONSTRAINT `news_likes_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
