const prisma = require('../utils/db');

const Folder = {
  // create
  async create(folderData) {
    return prisma.folder.create({
      data: folderData,
    });
  },

  // find
  async findById(folderId, userId) {
    return prisma.folder.findUnique({
      where: {
        id: folderId,
        creatorId: userId,
      },
    });
  },

  async findByIdWithParent(folderId, userId) {
    return prisma.folder.findUnique({
      where: {
        id: folderId,
        creatorId: userId,
      },
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

  async findByIdWithContent(folderId, userId) {
    return prisma.folder.findUnique({
      where: {
        id: folderId,
        creatorId: userId,
      },
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
  async findByIdWithBreadcrumbs(folderId, userId) {
    if (folderId === null) return null;

    return prisma.folder.findUnique({
      where: {
        id: folderId,
        creatorId: userId,
      },
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
  async update(folderId, userId, updateData) {
    return prisma.folder.update({
      where: {
        id: folderId,
        creatorId: userId,
      },
      data: updateData,
    });
  },

  // delete
  async delete(folderId, userId) {
    await prisma.$transaction(async (tx) => {
      await tx.folder.delete({
        where: {
          id: folderId,
          creatorId: userId,
        },
      });

      // get sum of user's file sizes
      const aggregations = await tx.file.aggregate({
        where: { creatorId: userId },
        _sum: { size: true },
      });

      // update user's storage value
      await tx.user.update({
        where: { id: userId },
        data: { storageUsed: aggregations._sum.size },
      });
    });
  },
};

module.exports = Folder;
