-- AlterTable: add `ctas` JSON column to carousel_slides to support multiple
-- CTA buttons per slide (text/link/openInNewTab/style each). Legacy single-CTA
-- columns (ctaText, ctaLink, ctaOpenInNewTab) are kept for backward compat.
ALTER TABLE `carousel_slides`
    ADD COLUMN `ctas` JSON NULL;
