const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function seed(prismaClient = prisma) {
  // seed new data
  const user = await prismaClient.user.create({
    data: {
      first: 'John',
      last: 'Smith',
      username: 'JSmith1',
      password: await bcrypt.hash('password', 10),
      storageUsed: 741986,
    },
  });

  await prismaClient.folder.create({
    data: {
      name: 'folder1',
      favorite: false,
      creatorId: user.id,
      subfolders: {
        create: [
          {
            name: 'subfolder1',
            favorite: false,
            creatorId: user.id,
            subfolders: {
              create: [
                {
                  name: 'subsubfolder1',
                  favorite: false,
                  creatorId: user.id,
                },
                {
                  name: 'subsubfolder2',
                  favorite: true,
                  creatorId: user.id,
                  files: {
                    create: [
                      {
                        cloudinaryPublicId: crypto.randomUUID(),
                        name: 'subsubfile1',
                        size: 32999,
                        format: 'pdf',
                        favorite: true,
                        creatorId: user.id,
                      },
                      {
                        cloudinaryPublicId: crypto.randomUUID(),
                        name: 'subsubfile4',
                        size: 1944,
                        format: 'webp',
                        favorite: false,
                        creatorId: user.id,
                      },
                      {
                        cloudinaryPublicId: crypto.randomUUID(),
                        name: 'subsubfile3',
                        size: 934,
                        format: 'jpeg',
                        favorite: false,
                        creatorId: user.id,
                      },
                    ],
                  },
                },
              ],
            },
            files: {
              create: [
                {
                  cloudinaryPublicId: crypto.randomUUID(),
                  name: 'subfile1',
                  size: 232367,
                  format: 'pdf',
                  favorite: true,
                  creatorId: user.id,
                },
                {
                  cloudinaryPublicId: crypto.randomUUID(),
                  name: 'subfile2',
                  size: 54433,
                  format: 'webp',
                  favorite: false,
                  creatorId: user.id,
                },
              ],
            },
          },
          {
            name: 'subfolder2',
            favorite: false,
            creatorId: user.id,
            files: {
              create: [
                {
                  cloudinaryPublicId: crypto.randomUUID(),
                  name: 'subfile3',
                  size: 23647,
                  format: 'pdf',
                  favorite: true,
                  creatorId: user.id,
                },
                {
                  cloudinaryPublicId: crypto.randomUUID(),
                  name: 'subfile4',
                  size: 54243,
                  format: 'webp',
                  favorite: false,
                  creatorId: user.id,
                },
              ],
            },
          },
          {
            name: 'subfolder3',
            favorite: true,
            creatorId: user.id,
          },
        ],
      },
      files: {
        create: [
          {
            cloudinaryPublicId: crypto.randomUUID(),
            name: 'file1',
            size: 236247,
            format: 'pdf',
            favorite: true,
            creatorId: user.id,
          },
          {
            cloudinaryPublicId: crypto.randomUUID(),
            name: 'file2',
            size: 12223,
            format: 'jpg',
            favorite: false,
            creatorId: user.id,
          },
          {
            cloudinaryPublicId: crypto.randomUUID(),
            name: 'file3',
            size: 10456,
            format: 'jpeg',
            favorite: true,
            creatorId: user.id,
          },
        ],
      },
    },
  });

  await prismaClient.file.createMany({
    data: [
      {
        cloudinaryPublicId: crypto.randomUUID(),
        name: 'truefile1',
        size: 45624,
        format: 'pdf',
        favorite: true,
        creatorId: user.id,
      },
      {
        cloudinaryPublicId: crypto.randomUUID(),
        name: 'truefile2',
        size: 12423,
        format: 'jpg',
        favorite: false,
        creatorId: user.id,
      },
      {
        cloudinaryPublicId: crypto.randomUUID(),
        name: 'truefile3',
        size: 24446,
        format: 'jpeg',
        favorite: false,
        creatorId: user.id,
      },
    ],
  });
}

// Export for tests / programmatic use
module.exports = seed;

// If run via CLI (e.g. `prisma db seed`), call with internal prisma
if (require.main === module) {
  seed(prisma)
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
