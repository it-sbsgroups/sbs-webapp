/*
  Warnings:

  - You are about to drop the `brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `brandgallery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `brandsocial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contactfieldconfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contactsubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contactsystemsettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `corporatehotline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `designation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employeebrand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employeeemail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employeephone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employeesocial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `faq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `faq_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `faqsystemsettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hero_carousels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ourbrand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ourbrandaward` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ourbrandcorevalue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ourbrandimage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ourbrandproject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productimage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productspecification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `testimonial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usersubmittedquestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `brandgallery` DROP FOREIGN KEY `BrandGallery_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `brandsocial` DROP FOREIGN KEY `BrandSocial_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `category` DROP FOREIGN KEY `Category_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_designationId_fkey`;

-- DropForeignKey
ALTER TABLE `employeebrand` DROP FOREIGN KEY `EmployeeBrand_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `employeebrand` DROP FOREIGN KEY `EmployeeBrand_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeeemail` DROP FOREIGN KEY `EmployeeEmail_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeephone` DROP FOREIGN KEY `EmployeePhone_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesocial` DROP FOREIGN KEY `EmployeeSocial_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `ourbrandaward` DROP FOREIGN KEY `OurBrandAward_ourBrandId_fkey`;

-- DropForeignKey
ALTER TABLE `ourbrandcorevalue` DROP FOREIGN KEY `OurBrandCoreValue_ourBrandId_fkey`;

-- DropForeignKey
ALTER TABLE `ourbrandimage` DROP FOREIGN KEY `OurBrandImage_ourBrandId_fkey`;

-- DropForeignKey
ALTER TABLE `ourbrandproject` DROP FOREIGN KEY `OurBrandProject_ourBrandId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `productimage` DROP FOREIGN KEY `ProductImage_productId_fkey`;

-- DropForeignKey
ALTER TABLE `productspecification` DROP FOREIGN KEY `ProductSpecification_productId_fkey`;

-- DropForeignKey
ALTER TABLE `testimonial` DROP FOREIGN KEY `Testimonial_brandId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `designation` ENUM('ADMIN', 'SALES', 'HUMANRESOURCE', 'IT') NOT NULL DEFAULT 'ADMIN',
    MODIFY `name` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `brand`;

-- DropTable
DROP TABLE `brandgallery`;

-- DropTable
DROP TABLE `brandsocial`;

-- DropTable
DROP TABLE `category`;

-- DropTable
DROP TABLE `contactfieldconfig`;

-- DropTable
DROP TABLE `contactsubmission`;

-- DropTable
DROP TABLE `contactsystemsettings`;

-- DropTable
DROP TABLE `corporatehotline`;

-- DropTable
DROP TABLE `designation`;

-- DropTable
DROP TABLE `employee`;

-- DropTable
DROP TABLE `employeebrand`;

-- DropTable
DROP TABLE `employeeemail`;

-- DropTable
DROP TABLE `employeephone`;

-- DropTable
DROP TABLE `employeesocial`;

-- DropTable
DROP TABLE `faq`;

-- DropTable
DROP TABLE `faq_items`;

-- DropTable
DROP TABLE `faqsystemsettings`;

-- DropTable
DROP TABLE `hero_carousels`;

-- DropTable
DROP TABLE `ourbrand`;

-- DropTable
DROP TABLE `ourbrandaward`;

-- DropTable
DROP TABLE `ourbrandcorevalue`;

-- DropTable
DROP TABLE `ourbrandimage`;

-- DropTable
DROP TABLE `ourbrandproject`;

-- DropTable
DROP TABLE `product`;

-- DropTable
DROP TABLE `productimage`;

-- DropTable
DROP TABLE `productspecification`;

-- DropTable
DROP TABLE `testimonial`;

-- DropTable
DROP TABLE `usersubmittedquestion`;
