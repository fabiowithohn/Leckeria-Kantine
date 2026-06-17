-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "additives" TEXT[] DEFAULT ARRAY[]::TEXT[];
