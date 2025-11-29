const { Prisma } = require('@prisma/client');
const prisma = require('../utils/db');
const { reformatSort } = require('../utils/helpers');

const Items = {
  async findUserFavorites(userId, sort) {
    const [column, direction] = reformatSort(sort);

    return prisma.$queryRaw`
      SELECT 
        id, name, favorite, null as size, null as format, 'folder' as type, "createdAt", "updatedAt", "parentId"
      FROM "Folder"
      WHERE "creatorId" = ${userId} AND favorite = true
      UNION ALL
      SELECT 
        id, name, favorite, size, format, 'file' as type, "createdAt", "updatedAt", "folderId" as "parentId"
      FROM "File"
      WHERE "creatorId" = ${userId} AND favorite = true
      ORDER BY ${Prisma.raw(column)} ${Prisma.raw(direction)} NULLS FIRST 
    `;
  },

  async findSearchResults(userId, query, sort) {
    const [column, direction] = reformatSort(sort);

    return prisma.$queryRaw`
      SELECT 
        id, name, favorite, null as size, null as format, 'folder' as type, "createdAt", "updatedAt", "parentId"
      FROM "Folder"
      WHERE "creatorId" = ${userId} AND name ILIKE ${`%${query}%`}
      UNION ALL
      SELECT 
        id, name, favorite, size, format, 'file' as type, "createdAt", "updatedAt", "folderId" as "parentId"
      FROM "File"
      WHERE "creatorId" = ${userId} AND name ILIKE ${`%${query}%`}
      ORDER BY ${Prisma.raw(column)} ${Prisma.raw(direction)} NULLS FIRST
    `;
  },

  async findContentByFolderId(userId, folderId, sort) {
    const [column, direction] = reformatSort(sort);

    return prisma.$queryRaw`
      SELECT 
        id, name, favorite, null as size, null as format, 'folder' as type, "createdAt", "updatedAt", "parentId"
      FROM "Folder"
      WHERE "creatorId" = ${userId} AND "parentId" ${folderId === null ? Prisma.sql`IS NULL` : Prisma.sql`= ${folderId}`}
      UNION ALL
      SELECT 
        id, name, favorite, size, format, 'file' as type, "createdAt", "updatedAt", "folderId" as "parentId"
      FROM "File"
      WHERE "creatorId" = ${userId} AND "folderId" ${folderId === null ? Prisma.sql`IS NULL` : Prisma.sql`= ${folderId}`}
      ORDER BY ${Prisma.raw(column)} ${Prisma.raw(direction)} NULLS FIRST
    `;
  },
};

module.exports = Items;
