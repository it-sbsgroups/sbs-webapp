-- AlterTable: denormalized fields so the news list/card endpoints never
-- need to select full block content (LongText) just to show a thumbnail
-- and a short excerpt.
ALTER TABLE `news_posts`
  ADD COLUMN `excerpt` VARCHAR(300) NULL,
  ADD COLUMN `coverImage` VARCHAR(500) NULL;

-- Composite index matching the actual list query (status filter + createdAt sort)
CREATE INDEX `news_posts_status_createdAt_idx` ON `news_posts`(`status`, `createdAt`);
