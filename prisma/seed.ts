import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.votingState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, status: "not_started" },
  });

  await prisma.topic.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, content: "" },
  });

  console.log("Seed completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
