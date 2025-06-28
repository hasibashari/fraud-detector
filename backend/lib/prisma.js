// lib/prisma.js
// const { PrismaClient } = require('@prisma/client');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
module.exports = prisma;