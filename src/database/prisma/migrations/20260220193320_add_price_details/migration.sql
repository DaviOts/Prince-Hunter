/*
  Warnings:

  - You are about to drop the column `amount` on the `Price` table. All the data in the column will be lost.
  - Added the required column `finalPrice` to the `Price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPrice` to the `Price` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Price" DROP COLUMN "amount",
ADD COLUMN     "discountPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "finalPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "originalPrice" DECIMAL(10,2) NOT NULL;
