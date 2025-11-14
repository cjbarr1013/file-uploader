-- AlterTable
ALTER TABLE "File" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
