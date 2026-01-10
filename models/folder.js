const prisma = require('../utils/db');

const Folder = {
  // create
  async create(folderData) {
    return prisma.folder.create({
      data: folderData,
    });
  },

  // find
  async findAll(userId) {
    return prisma.folder.findMany({
      where: {
        creatorId: userId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  },

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

    const parents = [];
    let currentFolder = await prisma.folder.findUnique({
      where: {
        id: folderId,
        creatorId: userId,
      },
      select: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    while (currentFolder?.parent) {
      parents.push(currentFolder.parent);
      currentFolder = await prisma.folder.findUnique({
        where: {
          id: currentFolder.parent.id,
          creatorId: userId,
        },
        select: {
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    return parents.reverse(); // [{id: 'direct-parent', name: '...'}, {id: 'grandparent', name: '...'}, ...]
  },

  async findAllChildFiles(folderId, userId) {
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
        creatorId: userId,
      },
      include: {
        files: true,
        subfolders: true,
      },
    });

    if (!folder) return [];

    // Start with files directly in this folder
    let allFiles = [...folder.files];

    // Recursively get files from each subfolder
    for (const subfolder of folder.subfolders) {
      const childFiles = await this.findAllChildFiles(subfolder.id, userId);
      allFiles = allFiles.concat(childFiles);
    }

    return allFiles;
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
