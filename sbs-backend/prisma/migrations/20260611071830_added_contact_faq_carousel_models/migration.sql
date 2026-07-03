-- CreateTable
CREATE TABLE `hero_carousels` (
    `id` VARCHAR(191) NOT NULL,
    `mediaType` ENUM('IMAGE', 'VIDEO') NOT NULL DEFAULT 'IMAGE',
    `mediaUrl` VARCHAR(512) NOT NULL,
    `videoLoop` BOOLEAN NOT NULL DEFAULT false,
    `videoNextOnEnd` BOOLEAN NOT NULL DEFAULT false,
    `duration` INTEGER NOT NULL DEFAULT 5,
    `layoutType` ENUM('LEFT', 'CENTER', 'RIGHT') NOT NULL DEFAULT 'LEFT',
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `ctaText` VARCHAR(50) NOT NULL DEFAULT 'Learn More',
    `ctaLink` VARCHAR(255) NOT NULL DEFAULT '#',
    `badgeColor` VARCHAR(50) NOT NULL DEFAULT 'bg-red-600',
    `ctaColor` VARCHAR(100) NOT NULL DEFAULT 'bg-blue-900 hover:bg-blue-800',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faq` (
    `id` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `answerJson` JSON NOT NULL,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `viewsCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Faq_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSubmittedQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `isAnswered` BOOLEAN NOT NULL DEFAULT false,
    `isPublishedFaq` BOOLEAN NOT NULL DEFAULT false,
    `adminAnswerJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FaqSystemSettings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `maxQuestionLength` INTEGER NOT NULL DEFAULT 500,
    `enforceEmailCheck` BOOLEAN NOT NULL DEFAULT true,
    `notifyAdminOnNewQ` BOOLEAN NOT NULL DEFAULT true,
    `autoResponseEmail` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq_items` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(512) NOT NULL,
    `slug` VARCHAR(512) NOT NULL,
    `answerJson` JSON NOT NULL,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `faq_items_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactFieldConfig` (
    `id` VARCHAR(191) NOT NULL,
    `fieldName` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `placeholder` VARCHAR(191) NULL,
    `fieldType` ENUM('TEXT', 'TEXTAREA', 'EMAIL', 'NUMBER', 'SELECT') NOT NULL DEFAULT 'TEXT',
    `gridWidth` ENUM('HALF', 'FULL') NOT NULL DEFAULT 'FULL',
    `isRequired` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `prefixIcon` VARCHAR(191) NULL,
    `postfixText` VARCHAR(191) NULL,
    `options` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ContactFieldConfig_fieldName_key`(`fieldName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactSubmission` (
    `id` VARCHAR(191) NOT NULL,
    `formData` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactSystemSettings` (
    `id` VARCHAR(191) NOT NULL,
    `pageMaxWidth` VARCHAR(191) NOT NULL DEFAULT 'max-w-6xl',
    `companyMailId` VARCHAR(191) NOT NULL DEFAULT 'procurement.desk@sbsgroups.com',
    `notifyCompany` BOOLEAN NOT NULL DEFAULT true,
    `notifyUser` BOOLEAN NOT NULL DEFAULT true,
    `companyMailTemplate` TEXT NOT NULL,
    `userThankYouTemplate` TEXT NOT NULL,
    `alertSuccessMessage` VARCHAR(191) NOT NULL DEFAULT 'Thank you! Your enquiry has been routed securely.',
    `mapEmbedUrl` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CorporateHotline` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
