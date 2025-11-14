require('dotenv').config();
const app = require('./app');
const prisma = require('./utils/db');

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received, closing server...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected...');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM')); // SIGTERM = termination signal (sent by process managers like PM2, Docker, systemd)
process.on('SIGINT', () => shutdown('SIGINT')); // SIGINT = interrupt signal (Ctrl+C in terminal)
