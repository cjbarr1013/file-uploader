const prisma = require('../utils/db');

module.exports = async function () {
  // Give a small delay to let any pending operations complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // disconnect database
  await prisma.$disconnect();
  console.log('Database disconnected...');
  process.exit(0);
};
