import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const duplicates = await prisma.prediction.groupBy({
    by: ["userId", "matchId"],
    _count: { _all: true },
    having: {
      id: { _count: { gt: 1 } }
    }
  });

  let deleted = 0;

  for (const duplicate of duplicates) {
    const rows = await prisma.prediction.findMany({
      where: {
        userId: duplicate.userId,
        matchId: duplicate.matchId
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true }
    });

    const [, ...toDelete] = rows;
    if (toDelete.length > 0) {
      const result = await prisma.prediction.deleteMany({
        where: { id: { in: toDelete.map((row) => row.id) } }
      });
      deleted += result.count;
    }
  }

  console.log(`Deduplication terminee. Pronostics doublons supprimes : ${deleted}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
