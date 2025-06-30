/*
  Warnings:

  - Added the required column `userId` to the `UploadBatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UploadBatch" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UploadBatch" ADD CONSTRAINT "UploadBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
