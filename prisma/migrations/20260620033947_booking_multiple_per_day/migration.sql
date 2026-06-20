-- DropIndex
DROP INDEX "Booking_userId_date_key";

-- CreateIndex
CREATE INDEX "Booking_userId_date_idx" ON "Booking"("userId", "date");
