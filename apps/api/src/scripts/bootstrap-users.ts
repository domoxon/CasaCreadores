// Crea (una sola vez) las cuentas internas de producción a partir de variables de entorno.
//
//   ADMIN_EMAIL / ADMIN_PASSWORD  -> cuenta ADMIN (panel /admin)
//   OPS_EMAIL   / OPS_PASSWORD    -> cuenta interna MARCA (herramienta /marca para publicar campañas)
//
// Es idempotente: si el email ya existe no toca nada (ni la contraseña). Se ejecuta en cada
// build de producción desde scripts/vercel-build.mjs. Sin las variables, no hace nada.
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureUser(email: string | undefined, password: string | undefined, role: UserRole) {
  if (!email || !password) {
    console.log(`[bootstrap] ${role}: sin variables, se omite.`);
    return;
  }
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    console.log(`[bootstrap] ${role}: ya existe, sin cambios.`);
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email: normalized,
      password: hash,
      role,
      emailVerified: true,
      ...(role === UserRole.MARCA
        ? { brand: { create: { companyName: "Casa Creadores (operaciones)", website: "https://casacreadores.com", industry: "Interno" } } }
        : {}),
    },
  });
  console.log(`[bootstrap] ${role}: creada.`);
}

async function main() {
  await ensureUser(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, UserRole.ADMIN);
  await ensureUser(process.env.OPS_EMAIL, process.env.OPS_PASSWORD, UserRole.MARCA);
}

main()
  .catch((err) => {
    console.error("[bootstrap] Error:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
