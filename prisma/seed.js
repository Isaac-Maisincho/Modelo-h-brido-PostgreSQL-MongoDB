// prisma/seed.js · Usuarios de prueba (idempotente: se puede ejecutar varias veces)
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const usuarios = [
  {
    name: "Administrador Cursos",
    email: "admin@cursos.com",
    password: "Admin123*",
    role: "ADMIN",
  },
  {
    name: "Isaac Maisincho",
    email: "estudiante@cursos.com",
    password: "Estudiante123*",
    role: "USER",
  },
];

async function main() {
  for (const u of usuarios) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, password: hashed, role: u.role },
      create: { name: u.name, email: u.email, password: hashed, role: u.role },
    });
    console.log(`Usuario listo: ${user.email} (${user.role}) id=${user.id}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
