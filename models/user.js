const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');

const User = {
  // create
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  },

  // find
  async findByUsername(username) {
    return prisma.user.findUnique({
      where: { username },
    });
  },

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async findByIdWithContent(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        files: true,
        folders: true,
      },
    });
  },

  // update
  async updateProfile(id, profileData) {
    return prisma.user.update({
      where: { id },
      data: profileData,
    });
  },

  // delete
  async delete(id) {
    return prisma.user.delete({
      where: { id },
    });
  },
};

module.exports = User;
