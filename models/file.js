const prisma = require('../utils/db');

const File = {
  // create
  async create(fileData, userId) {
    const transaction = await prisma.$transaction([
      prisma.file.create({ data: fileData }),
      prisma.user.update({
        where: { id: userId },
        data: {
          storageUsed: { increment: fileData.size },
        },
      }),
    ]);
    return transaction[0];
  },

  // find
  async findById(id, userId) {
    return prisma.file.findUnique({
      where: { id, creatorId: userId },
    });
  },

  async findByIdWithParent(id, userId) {
    return prisma.file.findUnique({
      where: { id, creatorId: userId },
      include: {
        folder: true,
      },
    });
  },

  async findRecent(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return prisma.file.findMany({
      where: {
        creatorId: userId,
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  // update
  async update(id, userId, updateData) {
    return prisma.file.update({
      where: { id, creatorId: userId },
      data: updateData,
    });
  },

  // delete
  async delete(id, userId) {
    await prisma.$transaction(async (tx) => {
      // get file for user's id and file size
      const file = await tx.file.findUnique({ where: { id } });

      await tx.file.delete({ where: { id } });

      // update user's storage value
      await tx.user.update({
        where: { id: userId },
        data: { storageUsed: { decrement: file.size } },
      });
    });
  },
};

module.exports = File;
