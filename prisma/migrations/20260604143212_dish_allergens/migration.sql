-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[];
