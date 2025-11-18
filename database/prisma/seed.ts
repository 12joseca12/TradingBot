import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: "hash123",
      settings: {
        create: {},
      },
    },
  });
  console.log("Created test user:", user.id);
}

main();
