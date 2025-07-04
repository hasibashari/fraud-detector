-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "channel" DROP NOT NULL,
ALTER COLUMN "channel" DROP DEFAULT,
ALTER COLUMN "transaction_type" DROP NOT NULL,
ALTER COLUMN "transaction_type" DROP DEFAULT,
ALTER COLUMN "user_id" DROP NOT NULL;
