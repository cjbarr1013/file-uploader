const prisma = require('../utils/db');

const Folder = {
  // create
  async create(folderData) {
    return prisma.folder.create({
      data: folderData,
    });
  },

  // find
  async findById(id) {
    return prisma.folder.findUnique({
      where: { id },
    });
  },

  async findByIdWithParent(id) {
    return prisma.folder.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async findByIdWithContent(id) {
    return prisma.folder.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        subfolders: true,
        files: true,
      },
    });
  },

  // ... > grandparent > parent > current
  async findByIdWithBreadcrumbs(id) {
    return prisma.folder.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        parent: {
          select: {
            id: true,
            name: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  // update
  async update(id, updateData) {
    return prisma.folder.update({
      where: { id },
      data: updateData,
    });
  },

  // delete
  async delete(id) {
    await prisma.$transaction(async (tx) => {
      // get folder before delete (we need user's id)
      const folder = await tx.folder.findUnique({ where: { id } });

      await tx.folder.delete({ where: { id } });

      // get sum of user's file sizes
      const aggregations = await tx.file.aggregate({
        where: { creatorId: folder.creatorId },
        _sum: { size: true },
      });

      // update user's storage value
      await tx.user.update({
        where: { id: folder.creatorId },
        data: { storageUsed: aggregations._sum.size },
      });
    });
  },
};

module.exports = Folder;
