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
    where: { slug: 'epic' },
    update: {},
    create: {
      slug: 'epic',
      name: 'Epic Games',
      url: 'https://store.epicgames.com/',
      iconUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_1.svg/256px-Steam_icon_1.svg.png',
    },
  });
  const GOG = await prisma.store.upsert({
    where: { slug: 'gog' },
    update: {},
    create: {
      slug: 'gog',
      name: 'GOG',
      url: 'https://www.gog.com/',
      iconUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_1.svg/256px-Steam_icon_1.svg.png',
    },
  });
  const Nuuvem = await prisma.store.upsert({
    where: { slug: 'nuuvem' },
    update: {},
    create: {
      slug: 'nuuvem',
      name: 'Nuuvem',
      url: 'https://www.nuuvem.com/',
      iconUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_1.svg/256px-Steam_icon_1.svg.png',
    },
  });
  const TwoGame = await prisma.store.upsert({
    where: { slug: '2game' },
    update: {},
    create: {
      slug: '2game',
      name: '2game',
      url: 'https://www.2game.com/',
      iconUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_1.svg/256px-Steam_icon_1.svg.png',
    },
  });
  console.log({ Steam, EpicGames, GOG, Nuuvem, TwoGame });
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
