/*
  Warnings:

  - The values [CO_FOUNDER] on the enum `User_designation` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `designation` ENUM('ADMIN', 'SALES', 'HUMANRESOURCE', 'IT', 'FOUNDER', 'COFOUNDER') NOT NULL DEFAULT 'ADMIN';
