import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const Steam = await prisma.store.upsert({
    where: { slug: 'steam' },
    update: {},
    create: {
      slug: 'steam',
      name: 'Steam',
      url: 'https://store.steampowered.com/',
      iconUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_1.svg/256px-Steam_icon_1.svg.png',
    },
  });
  const EpicGames = await prisma.store.upsert({
    where: { slug: 'epic-games' },
    update: {},
    create: {
      slug: 'epic-games',
      name: 'Epic Games',
      url: 'https://store.epicgames.com/',
      iconUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_1.svg/256px-Steam_icon_1.svg.png',
    },
  });
  console.log({ Steam, EpicGames });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
