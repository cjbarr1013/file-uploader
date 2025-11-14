require('dotenv').config({ path: '.env.test' });
const { execSync } = require('child_process');

module.exports = async () => {
  // Run migrations and seed to ensure schema is up to date
  execSync('npx prisma migrate reset --force', {
    env: { ...process.env },
    stdio: 'inherit',
  });
};
