import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ScraperService } from './scraper.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { generateSlug } from 'src/common/utils';

interface ScrapeJobData {
  gameTitle: string;
  gameId: string;
}

@Processor('scraper')
export class ScraperProcessor extends WorkerHost {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly prisma: PrismaService,
  ) {
    super(); //obligatory, because calls constructor of WorkerHost
  }

  async process(job: Job<ScrapeJobData>): Promise<void> {
    const { gameTitle, gameId } = job.data;
    console.log(
      `[PROCESSOR] Starting scrape for "${gameTitle}" (id: ${gameId})`,
    );

    //search prices in all strategies
    const prices = await this.scraperService.scrapeAll(gameTitle);
    if (!prices.length) {
      console.log(`[PROCESSOR] No prices found for "${gameTitle}"`);
      return;
    }

    //update game with canonical title
    const canonicalTitle = prices[0].canonicalTitle ?? gameTitle;
    const slug = generateSlug(canonicalTitle);
    await this.prisma.game.update({
      where: { id: gameId },
      data: { title: canonicalTitle, slug },
    });

    //save prices in database
    //if we have 5 prices, we will create 5 promises and run them in *parallel*
    await Promise.all(
      prices.map(async (price) => {
        const store = await this.prisma.store.findUnique({
          where: { slug: price.storeSlug },
        });
        if (!store) return;
        //search last price registered for this game and store, if the price didn't change, we will not register it again
        const lastPrice = await this.prisma.price.findFirst({
          where: { gameId, storeId: store.id },
          orderBy: { createdAt: 'desc' },
        });

        //avoid duplicate if price didn't change
        if (lastPrice && lastPrice.finalPrice.toNumber() === price.finalPrice)
          return;

        await this.prisma.price.create({
          data: {
            gameId,
            storeId: store.id,
            url: price.url,
            finalPrice: price.finalPrice,
            originalPrice: price.initialPrice,
            discountPercent: price.discountPercent,
          },
        });
      }),
    );

    console.log(
      `[Processor] Saved ${prices.length} prices for "${canonicalTitle}"`,
    );
  }
}
