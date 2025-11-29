/*
  Warnings:

  - A unique constraint covering the columns `[cloudinaryPublicId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cloudinaryPublicId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "cloudinaryPublicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "storageUsed" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "File_cloudinaryPublicId_key" ON "File"("cloudinaryPublicId");
