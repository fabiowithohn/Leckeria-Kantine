-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "canteen" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "exportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanDish" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "uses" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanDish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealPlan_year_week_idx" ON "MealPlan"("year", "week");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_canteen_year_week_key" ON "MealPlan"("canteen", "year", "week");

-- CreateIndex
CREATE UNIQUE INDEX "PlanDish_key_key" ON "PlanDish"("key");
