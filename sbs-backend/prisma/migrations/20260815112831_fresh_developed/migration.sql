-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `designation` ENUM('ADMIN', 'SALES', 'HUMANRESOURCE', 'IT', 'FOUNDER', 'COFOUNDER') NOT NULL DEFAULT 'ADMIN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `image` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subcategories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `image` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subcategories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logo` TEXT NULL,
    `website` TEXT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isOwnBrand` BOOLEAN NOT NULL DEFAULT false,
    `description` LONGTEXT NULL,
    `gallery` JSON NULL,
    `brochureUrl` TEXT NULL,
    `brochureName` VARCHAR(191) NULL,
    `brochureSize` INTEGER NULL,
    `brochureFormat` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `brands_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NULL,
    `description` LONGTEXT NULL,
    `keyFeatures` TEXT NULL,
    `material` TEXT NULL,
    `manufacturer` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isPrelaunch` BOOLEAN NOT NULL DEFAULT false,
    `launchDate` DATETIME(3) NULL,
    `prelaunchTeaser` TEXT NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `slug` VARCHAR(191) NULL,
    `keywords` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `subcategoryId` VARCHAR(191) NULL,
    `brandId` VARCHAR(191) NULL,
    `brochureUrl` TEXT NULL,
    `videoUrl` TEXT NULL,
    `brochureName` VARCHAR(191) NULL,
    `brochureSize` INTEGER NULL,
    `brochureFormat` VARCHAR(191) NULL,
    `brochurePublicId` VARCHAR(191) NULL,
    `brochureResourceType` VARCHAR(191) NULL,
    `designFileUrl` TEXT NULL,
    `designFileName` VARCHAR(191) NULL,
    `designFileSize` INTEGER NULL,
    `designFileFormat` VARCHAR(191) NULL,
    `designFilePublicId` VARCHAR(191) NULL,
    `designFileResourceType` VARCHAR(191) NULL,

    UNIQUE INDEX `products_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_launch_notifies` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `product_launch_notifies_productId_email_key`(`productId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `attributes` JSON NOT NULL,
    `model` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `keyFeatures` TEXT NULL,
    `specifications` JSON NULL,
    `images` JSON NULL,
    `brandId` VARCHAR(191) NULL,
    `brochureUrl` TEXT NULL,
    `brochureName` VARCHAR(191) NULL,
    `brochureSize` INTEGER NULL,
    `brochureFormat` VARCHAR(191) NULL,
    `brochurePublicId` VARCHAR(191) NULL,
    `brochureResourceType` VARCHAR(191) NULL,
    `designFileUrl` TEXT NULL,
    `designFileName` VARCHAR(191) NULL,
    `designFileSize` INTEGER NULL,
    `designFileFormat` VARCHAR(191) NULL,
    `designFilePublicId` VARCHAR(191) NULL,
    `designFileResourceType` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `title` VARCHAR(500) NULL,
    `angle` VARCHAR(100) NULL,
    `altText` VARCHAR(500) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_specifications` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `product_specifications_productId_key_key`(`productId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_certifications` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `applications_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_requests` (
    `id` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'REPLIED', 'PROCESSING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `fullName` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `address` TEXT NULL,
    `remarks` TEXT NULL,
    `customFields` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rfq_requests_reference_key`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_counters` (
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `count` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_items` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `rfqId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,

    UNIQUE INDEX `rfq_items_rfqId_productId_variantId_key`(`rfqId`, `productId`, `variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_replies` (
    `id` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `emailSubject` VARCHAR(191) NULL,
    `emailBody` TEXT NULL,
    `sentTo` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NULL,
    `rfqId` VARCHAR(191) NOT NULL,
    `items` JSON NULL,
    `subtotal` DOUBLE NULL,
    `overallDiscountPercent` DOUBLE NULL DEFAULT 0,
    `discountTotal` DOUBLE NULL,
    `grandTotal` DOUBLE NULL,
    `termsAndConditions` TEXT NULL,
    `includePrivacyPolicy` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `buttonText` VARCHAR(191) NOT NULL DEFAULT 'Quote Bucket',
    `buttonColor` VARCHAR(191) NOT NULL DEFAULT '#172554',
    `submitText` VARCHAR(191) NOT NULL DEFAULT '🚀 Dispatch Quotation Slip',
    `autoReplyEnabled` BOOLEAN NOT NULL DEFAULT true,
    `customerEmailSubject` VARCHAR(191) NULL,
    `customerEmailBody` TEXT NULL,
    `teamNotifyEnabled` BOOLEAN NOT NULL DEFAULT true,
    `teamEmailSubject` VARCHAR(191) NULL,
    `teamEmailBody` TEXT NULL,
    `forwardToEmails` JSON NULL,
    `customFields` JSON NULL,
    `defaultTermsAndConditions` TEXT NULL,
    `privacyPolicyText` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `cardsPerRow` INTEGER NOT NULL DEFAULT 3,
    `gap` VARCHAR(191) NOT NULL DEFAULT 'md',
    `pageBackground` VARCHAR(191) NOT NULL DEFAULT '#f8fafc',
    `maxWidth` VARCHAR(191) NOT NULL DEFAULT 'max-w-6xl',
    `productsPerPage` INTEGER NOT NULL DEFAULT 12,
    `cardStyle` VARCHAR(191) NOT NULL DEFAULT 'elevated',
    `cardBackground` VARCHAR(191) NOT NULL DEFAULT '#ffffff',
    `accentColor` VARCHAR(191) NOT NULL DEFAULT '#1e3a8a',
    `cornerRadius` VARCHAR(191) NOT NULL DEFAULT 'rounded-2xl',
    `imageFit` VARCHAR(191) NOT NULL DEFAULT 'contain',
    `imageRatio` VARCHAR(191) NOT NULL DEFAULT 'square',
    `imageBackground` VARCHAR(191) NOT NULL DEFAULT '#f8fafc',
    `showBrandBadge` BOOLEAN NOT NULL DEFAULT true,
    `showModel` BOOLEAN NOT NULL DEFAULT true,
    `showKeyFeatures` BOOLEAN NOT NULL DEFAULT true,
    `showSkuId` BOOLEAN NOT NULL DEFAULT true,
    `showPricePill` BOOLEAN NOT NULL DEFAULT true,
    `priceLabel` VARCHAR(191) NOT NULL DEFAULT 'Price On Request',
    `showSearch` BOOLEAN NOT NULL DEFAULT true,
    `showBrandFilter` BOOLEAN NOT NULL DEFAULT true,
    `showSidebar` BOOLEAN NOT NULL DEFAULT true,
    `showPagination` BOOLEAN NOT NULL DEFAULT true,
    `showQuoteBucketButton` BOOLEAN NOT NULL DEFAULT true,
    `autoRefreshSeconds` INTEGER NOT NULL DEFAULT 0,
    `detailSettings` JSON NULL,
    `notificationSettings` JSON NULL,
    `showBrochureButton` BOOLEAN NOT NULL DEFAULT true,
    `brochureButtonText` VARCHAR(191) NOT NULL DEFAULT 'Download Brochure',
    `brochureMode` VARCHAR(191) NOT NULL DEFAULT 'download',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_integrations` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `externalApiEnabled` BOOLEAN NOT NULL DEFAULT false,
    `externalApiUrl` TEXT NULL,
    `externalApiKey` TEXT NULL,
    `externalApiSecret` TEXT NULL,
    `sheetEnabled` BOOLEAN NOT NULL DEFAULT false,
    `sheetId` TEXT NULL,
    `sheetTabName` VARCHAR(191) NOT NULL DEFAULT 'RFQs',
    `googleServiceAccountJson` LONGTEXT NULL,
    `inboundWebhookEnabled` BOOLEAN NOT NULL DEFAULT false,
    `inboundWebhookSecret` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scheduled_notifications` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `targetIds` JSON NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `sentAt` DATETIME(3) NULL,
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isDailyBatch` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `productsMode` VARCHAR(191) NOT NULL DEFAULT 'INSTANT',
    `productsBatchTime` VARCHAR(191) NOT NULL DEFAULT '18:00',
    `newsMode` VARCHAR(191) NOT NULL DEFAULT 'INSTANT',
    `newsBatchTime` VARCHAR(191) NOT NULL DEFAULT '18:00',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_keys` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `key` VARCHAR(500) NOT NULL,
    `permissions` JSON NULL,
    `allowedIps` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastUsedAt` DATETIME(3) NULL,
    `requestCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `api_keys_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `search_logs` (
    `id` VARCHAR(191) NOT NULL,
    `keyword` VARCHAR(191) NOT NULL,
    `results` INTEGER NOT NULL DEFAULT 0,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscribers` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `subscribedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unsubscribedAt` DATETIME(3) NULL,

    UNIQUE INDEX `subscribers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_logs` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `body` TEXT NULL,
    `recipients` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'sent',
    `productIds` JSON NULL,
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `excerpt` VARCHAR(300) NULL,
    `coverImage` VARCHAR(500) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `likesCount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `news_posts_slug_key`(`slug`),
    INDEX `news_posts_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_likes` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `news_likes_postId_ip_key`(`postId`, `ip`),
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
    `commentsRequireApproval` BOOLEAN NOT NULL DEFAULT true,
    `commentsAllowReplies` BOOLEAN NOT NULL DEFAULT true,
    `latestNewsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `latestNewsCount` INTEGER NOT NULL DEFAULT 5,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(149) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `mobile` VARCHAR(15) NOT NULL,
    `image` TEXT NULL,
    `designation` VARCHAR(100) NULL,
    `department` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employees_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `newsletterSubscriber` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(50) NULL,
    `middleName` VARCHAR(50) NULL,
    `lastName` VARCHAR(50) NULL,
    `email` VARCHAR(250) NOT NULL,
    `mobile` VARCHAR(13) NULL,
    `whatsapp` VARCHAR(13) NULL,
    `subscribed` BOOLEAN NOT NULL DEFAULT true,
    `notifyProducts` BOOLEAN NOT NULL DEFAULT true,
    `notifyNews` BOOLEAN NOT NULL DEFAULT true,
    `unsubscribeToken` VARCHAR(191) NULL,
    `unsubscribedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `newsletterSubscriber_email_key`(`email`),
    UNIQUE INDEX `newsletterSubscriber_mobile_key`(`mobile`),
    UNIQUE INDEX `newsletterSubscriber_unsubscribeToken_key`(`unsubscribeToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carousel_slides` (
    `id` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `nextSlideIn` INTEGER NOT NULL DEFAULT 5,
    `mediaType` VARCHAR(191) NOT NULL DEFAULT 'IMAGE',
    `mediaUrl` TEXT NULL,
    `videoLoop` BOOLEAN NOT NULL DEFAULT false,
    `videoSound` BOOLEAN NOT NULL DEFAULT false,
    `solidColor` VARCHAR(191) NULL,
    `layoutType` VARCHAR(191) NOT NULL DEFAULT 'LEFT',
    `badge` TEXT NULL,
    `title` TEXT NULL,
    `description` LONGTEXT NULL,
    `ctaText` VARCHAR(191) NULL,
    `ctaLink` TEXT NULL,
    `ctaOpenInNewTab` BOOLEAN NOT NULL DEFAULT false,
    `ctas` JSON NULL,
    `styles` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `carousel_slides_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carousel_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `prevButton` BOOLEAN NOT NULL DEFAULT true,
    `nextButton` BOOLEAN NOT NULL DEFAULT true,
    `bottomDots` BOOLEAN NOT NULL DEFAULT true,
    `autoplay` BOOLEAN NOT NULL DEFAULT true,
    `carouselHeight` VARCHAR(191) NOT NULL DEFAULT '650px',
    `overlayOpacity` DOUBLE NOT NULL DEFAULT 0.55,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `contactName` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `companyAddress` TEXT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `logo` TEXT NULL,
    `website` TEXT NULL,
    `gallery` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clients_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonials` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NULL,
    `testimony` LONGTEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'REWRITE') NOT NULL DEFAULT 'PENDING',
    `sourceType` ENUM('CLIENT', 'BRAND') NOT NULL DEFAULT 'CLIENT',
    `clientId` VARCHAR(191) NULL,
    `brandId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `testimonials_status_idx`(`status`),
    INDEX `testimonials_clientId_idx`(`clientId`),
    INDEX `testimonials_brandId_idx`(`brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonial_passcodes` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `sourceType` ENUM('CLIENT', 'BRAND') NOT NULL DEFAULT 'CLIENT',
    `companyName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NULL,
    `brandId` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `testimonial_passcodes_code_key`(`code`),
    INDEX `testimonial_passcodes_clientId_idx`(`clientId`),
    INDEX `testimonial_passcodes_brandId_idx`(`brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_configs` (
    `key` VARCHAR(191) NOT NULL,
    `data` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faqs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `question` TEXT NOT NULL,
    `answer` LONGTEXT NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `isListedOnFaqPage` BOOLEAN NOT NULL DEFAULT false,
    `isFeaturedInComponent` BOOLEAN NOT NULL DEFAULT false,
    `isAdminCreated` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `faqs_isApproved_deletedAt_idx`(`isApproved`, `deletedAt`),
    INDEX `faqs_isListedOnFaqPage_deletedAt_idx`(`isListedOnFaqPage`, `deletedAt`),
    INDEX `faqs_isFeaturedInComponent_deletedAt_idx`(`isFeaturedInComponent`, `deletedAt`),
    INDEX `faqs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `companyName` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `responded` BOOLEAN NOT NULL DEFAULT false,
    `adminNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `contacts_email_idx`(`email`),
    INDEX `contacts_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_responses` (
    `id` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `emailBody` TEXT NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sentFrom` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(500) NULL,
    `receivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `contact_responses_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IndustryInnovation` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `image` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IndustryInnovationKey` (
    `id` VARCHAR(191) NOT NULL,
    `innovationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhyChooseUs` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhyChooseUsKey` (
    `id` VARCHAR(191) NOT NULL,
    `WhyChooseUsId` VARCHAR(191) NOT NULL,
    `icon` TEXT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ourPrinciple` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `titleimage` TEXT NOT NULL,
    `descriptionimage` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthoriedNetwork` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_logs` (
    `id` VARCHAR(191) NOT NULL,
    `level` ENUM('INFO', 'WARN', 'ERROR') NOT NULL DEFAULT 'INFO',
    `source` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `meta` JSON NULL,
    `reviewed` BOOLEAN NOT NULL DEFAULT false,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `system_logs_reviewed_reviewedAt_idx`(`reviewed`, `reviewedAt`),
    INDEX `system_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_otps` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL DEFAULT 'site-config',
    `consumed` BOOLEAN NOT NULL DEFAULT false,
    `consumedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `admin_otps_userId_purpose_idx`(`userId`, `purpose`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionName` VARCHAR(191) NOT NULL,
    `heading` VARCHAR(191) NOT NULL,
    `subHeading` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `imageUrls` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `sectionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certificate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProductApplications` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProductApplications_AB_unique`(`A`, `B`),
    INDEX `_ProductApplications_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_VariantApplications` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_VariantApplications_AB_unique`(`A`, `B`),
    INDEX `_VariantApplications_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subcategories` ADD CONSTRAINT `subcategories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `subcategories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_launch_notifies` ADD CONSTRAINT `product_launch_notifies_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_specifications` ADD CONSTRAINT `product_specifications_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_certifications` ADD CONSTRAINT `product_certifications_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_items` ADD CONSTRAINT `rfq_items_rfqId_fkey` FOREIGN KEY (`rfqId`) REFERENCES `rfq_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_items` ADD CONSTRAINT `rfq_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_items` ADD CONSTRAINT `rfq_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfq_replies` ADD CONSTRAINT `rfq_replies_rfqId_fkey` FOREIGN KEY (`rfqId`) REFERENCES `rfq_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_subcategories` ADD CONSTRAINT `news_subcategories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `news_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_posts` ADD CONSTRAINT `news_posts_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `news_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_posts` ADD CONSTRAINT `news_posts_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `news_subcategories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_likes` ADD CONSTRAINT `news_likes_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_blocks` ADD CONSTRAINT `news_blocks_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_versions` ADD CONSTRAINT `news_versions_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_comments` ADD CONSTRAINT `news_comments_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_comments` ADD CONSTRAINT `news_comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `news_comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonial_passcodes` ADD CONSTRAINT `testimonial_passcodes_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonial_passcodes` ADD CONSTRAINT `testimonial_passcodes_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_responses` ADD CONSTRAINT `contact_responses_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IndustryInnovationKey` ADD CONSTRAINT `IndustryInnovationKey_innovationId_fkey` FOREIGN KEY (`innovationId`) REFERENCES `IndustryInnovation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhyChooseUsKey` ADD CONSTRAINT `WhyChooseUsKey_WhyChooseUsId_fkey` FOREIGN KEY (`WhyChooseUsId`) REFERENCES `WhyChooseUs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `PageSection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductApplications` ADD CONSTRAINT `_ProductApplications_A_fkey` FOREIGN KEY (`A`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductApplications` ADD CONSTRAINT `_ProductApplications_B_fkey` FOREIGN KEY (`B`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_VariantApplications` ADD CONSTRAINT `_VariantApplications_A_fkey` FOREIGN KEY (`A`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_VariantApplications` ADD CONSTRAINT `_VariantApplications_B_fkey` FOREIGN KEY (`B`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
