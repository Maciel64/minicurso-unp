/*
  Warnings:

  - Added the required column `externalId` to the `Billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `Billing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Billing" ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "link" TEXT NOT NULL;
