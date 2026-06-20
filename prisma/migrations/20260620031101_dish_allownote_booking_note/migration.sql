-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "allowNote" BOOLEAN NOT NULL DEFAULT false;
