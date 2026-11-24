// src/db/prisma.js · Cliente único de Prisma 7 (driver adapter de PostgreSQL)
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const connectPostgres = async () => {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  console.log("Conectado a PostgreSQL");
};

module.exports = { prisma, connectPostgres };
