/*
  Warnings:

  - You are about to drop the column `image` on the `Sneaker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Sneaker` DROP COLUMN `image`,
    ADD COLUMN `image_url` VARCHAR(191) NOT NULL DEFAULT 'https://www.placeholder.com/200/300',
    ADD COLUMN `image_url2` VARCHAR(191) NOT NULL DEFAULT 'https://www.placeholder.com/200/300',
    ADD COLUMN `image_url3` VARCHAR(191) NOT NULL DEFAULT 'https://www.placeholder.com/200/300';
