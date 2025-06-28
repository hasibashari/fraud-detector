/*
  Warnings:

  - You are about to drop the column `uploadBatchId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `batchId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_uploadBatchId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "uploadBatchId",
ADD COLUMN     "batchId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "UploadBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
