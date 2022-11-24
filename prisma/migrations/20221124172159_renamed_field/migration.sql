/*
  Warnings:

  - You are about to drop the column `emailToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailToken",
ADD COLUMN     "twoFactorToken" TEXT;
