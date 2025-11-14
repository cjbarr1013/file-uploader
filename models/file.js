const prisma = require('../utils/db');

const File = {
  // create
  async create(fileData) {
    const transaction = await prisma.$transaction([
      prisma.file.create({ data: fileData }),
      prisma.user.update({
        where: { id: fileData.creatorId },
        data: {
          storageUsed: { increment: fileData.size },
        },
      }),
    ]);
    return transaction[0];
  },

  // find
  async findById(id) {
    return prisma.file.findUnique({
      where: { id },
    });
  },

  async findByIdWithParent(id) {
    return prisma.file.findUnique({
      where: { id },
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
  async update(id, updateData) {
    return prisma.file.update({
      where: { id },
      data: updateData,
    });
  },

  // delete
  async delete(id) {
    await prisma.$transaction(async (tx) => {
      // get file for user's id and file size
      const file = await tx.file.findUnique({ where: { id } });

      await tx.file.delete({ where: { id } });

      // update user's storage value
      await tx.user.update({
        where: { id: file.creatorId },
        data: { storageUsed: { decrement: file.size } },
      });
    });
  },
};

module.exports = File;
