/*
  Warnings:

  - You are about to drop the `GrenzebachDish` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MenuSlot" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'DAILY_FIXED');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_dishId_fkey";

-- DropTable
DROP TABLE "GrenzebachDish";

-- DropEnum
DROP TYPE "DishType";

-- DropEnum
DROP TYPE "Weekday";

-- CreateTable
CREATE TABLE "Dish" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageData" BYTEA,
    "imageMime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuAssignment" (
    "id" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "slot" "MenuSlot" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuAssignment_slot_active_idx" ON "MenuAssignment"("slot", "active");

-- CreateIndex
CREATE UNIQUE INDEX "MenuAssignment_dishId_slot_key" ON "MenuAssignment"("dishId", "slot");

-- AddForeignKey
ALTER TABLE "MenuAssignment" ADD CONSTRAINT "MenuAssignment_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
