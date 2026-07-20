-- AlterTable: rich-text description for brands & own brands. Rendered on the
-- shared /brands/[slug] detail page only when non-empty.
ALTER TABLE `brands`
    ADD COLUMN `description` LONGTEXT NULL;
