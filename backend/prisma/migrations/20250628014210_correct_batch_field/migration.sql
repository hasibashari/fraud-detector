/*
  Warnings:

  - You are about to drop the column `batchId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_batchId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "batchId",
ADD COLUMN     "uploadBatchId" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_uploadBatchId_fkey" FOREIGN KEY ("uploadBatchId") REFERENCES "UploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
