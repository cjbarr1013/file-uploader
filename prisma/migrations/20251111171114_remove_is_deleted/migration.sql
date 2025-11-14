/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Folder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "isDeleted";

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "isDeleted";
