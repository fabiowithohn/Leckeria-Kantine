/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `GrenzebachDish` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GrenzebachDish" DROP COLUMN "imageUrl",
ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageMime" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
