const prisma = require('../utils/db');
const seed = require('../prisma/seed'); // export a seed(prisma) function

beforeEach(async () => {
  // Truncate all tables and reset sequences in one command
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "User", "Folder", "File", "Session" RESTART IDENTITY CASCADE'
  );

  // reseed in-process (no execSync) (much faster)
  await seed(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});
