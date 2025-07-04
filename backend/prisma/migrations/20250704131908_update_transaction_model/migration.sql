/*
  Warnings:

  - You are about to drop the column `aiExplanation` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "aiExplanation",
ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'mobile',
ADD COLUMN     "device_type" TEXT NOT NULL DEFAULT 'Android',
ADD COLUMN     "geminiExplanation" TEXT,
ADD COLUMN     "transaction_type" TEXT NOT NULL DEFAULT 'purchase',
ADD COLUMN     "user_id" TEXT NOT NULL DEFAULT '0',
ALTER COLUMN "location" SET DEFAULT 'Unknown';
