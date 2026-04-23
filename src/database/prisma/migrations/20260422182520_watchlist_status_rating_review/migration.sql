-- CreateEnum
CREATE TYPE "WatchlistStatus" AS ENUM ('PLAYING', 'COMPLETED', 'DROPPED', 'PLAN_TO_PLAY');

-- AlterTable
ALTER TABLE "Watchlist" ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "review" TEXT,
ADD COLUMN     "status" "WatchlistStatus" NOT NULL DEFAULT 'PLAN_TO_PLAY';
