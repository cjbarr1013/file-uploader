const prisma = require('../utils/db');

async function seed(prismaClient = prisma) {
  // seed new data
  const user = await prismaClient.user.create({
    data: {
      first: 'John',
      last: 'Smith',
      username: 'JSmith1',
      password: 'password',
      storageUsed: 60676,
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
                        name: 'subsubfile1',
                        size: 32999,
                        format: 'pdf',
                        favorite: true,
                        creatorId: user.id,
                      },
                      {
                        name: 'subsubfile4',
                        size: 1944,
                        format: 'webp',
                        favorite: false,
                        creatorId: user.id,
                      },
                      {
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
                  name: 'subfile1',
                  size: 2367,
                  format: 'pdf',
                  favorite: true,
                  creatorId: user.id,
                },
                {
                  name: 'subfile2',
                  size: 543,
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
                  name: 'subfile3',
                  size: 2367,
                  format: 'pdf',
                  favorite: true,
                  creatorId: user.id,
                },
                {
                  name: 'subfile4',
                  size: 543,
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
            name: 'file1',
            size: 2367,
            format: 'pdf',
            favorite: true,
            creatorId: user.id,
          },
          {
            name: 'file2',
            size: 123,
            format: 'jpg',
            favorite: false,
            creatorId: user.id,
          },
          {
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
        name: 'truefile1',
        size: 4564,
        format: 'pdf',
        favorite: true,
        creatorId: user.id,
      },
      {
        name: 'truefile2',
        size: 1223,
        format: 'jpg',
        favorite: false,
        creatorId: user.id,
      },
      {
        name: 'truefile3',
        size: 246,
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
