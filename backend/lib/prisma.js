// =========================
// Prisma Client Setup
// =========================

// Import PrismaClient dari hasil generate Prisma (bukan dari @prisma/client langsung)
const { PrismaClient } = require('../generated/prisma');

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

// Export instance prisma agar bisa digunakan di seluruh project
module.exports = prisma;
