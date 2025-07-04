-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "channel" SET DEFAULT 'unknown',
ALTER COLUMN "device_type" DROP NOT NULL,
ALTER COLUMN "transaction_type" SET DEFAULT 'purchase';
