-- AlterTable
ALTER TABLE `rfq_settings` MODIFY `submitText` VARCHAR(191) NOT NULL DEFAULT '🚀 Dispatch Quotation Slip';

-- CreateTable
CREATE TABLE `news_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `news_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_subcategories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `news_subcategories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_posts` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `subcategoryId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `allowVersioning` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `news_posts_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_blocks` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `style` JSON NULL,
    `images` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_versions` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `blocks` JSON NOT NULL,
    `editorNote` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_comments` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `depth` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `isHardDeleted` BOOLEAN NOT NULL DEFAULT false,
    `geolocation` JSON NULL,
    `editHistory` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_ad_products` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `news_ad_products_postId_productId_key`(`postId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `cardsPerRow` INTEGER NOT NULL DEFAULT 3,
    `cardsPerPage` INTEGER NOT NULL DEFAULT 9,
    `showSearch` BOOLEAN NOT NULL DEFAULT true,
    `showCategoryFilter` BOOLEAN NOT NULL DEFAULT true,
    `showSubcategoryFilter` BOOLEAN NOT NULL DEFAULT true,
    `carouselVisibleCards` INTEGER NOT NULL DEFAULT 4,
    `carouselTotalToPull` INTEGER NOT NULL DEFAULT 10,
    `carouselAutoPlay` BOOLEAN NOT NULL DEFAULT true,
    `carouselPauseOnHover` BOOLEAN NOT NULL DEFAULT true,
    `carouselIntervalMs` INTEGER NOT NULL DEFAULT 3000,
    `adsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `adsMaxProducts` INTEGER NOT NULL DEFAULT 4,
    `adsPlacement` VARCHAR(191) NOT NULL DEFAULT 'sidebar',
    `commentsRequireApproval` BOOLEAN NOT NULL DEFAULT true,
    `commentsAllowReplies` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `news_subcategories` ADD CONSTRAINT `news_subcategories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `news_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_posts` ADD CONSTRAINT `news_posts_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `news_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_posts` ADD CONSTRAINT `news_posts_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `news_subcategories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_blocks` ADD CONSTRAINT `news_blocks_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_versions` ADD CONSTRAINT `news_versions_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_comments` ADD CONSTRAINT `news_comments_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_comments` ADD CONSTRAINT `news_comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `news_comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_ad_products` ADD CONSTRAINT `news_ad_products_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
