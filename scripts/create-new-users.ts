import { PrismaClient } from "../src/generated/prisma/client.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

// ─── Daftar user baru (email berbeda dari yang sudah ada) ──────────
const newUsers = [
  {
    name: "Admin Baru",
    email: "admin2@labmuma.id",
    password: "admin2024",
    role: "ADMIN",
  },
  {
    name: "Toolman Baru",
    email: "toolman2@labmuma.id",
    password: "toolman2024",
    role: "TOOLMAN",
  },
  {
    name: "Guru Baru",
    email: "guru2@labmuma.id",
    password: "guru2024",
    role: "GURU",
  },
  {
    name: "Siswa Baru",
    email: "siswa2@labmuma.id",
    password: "siswa2024",
    role: "SISWA",
  },
];

async function main() {
  console.log("👤 Membuat user baru untuk setiap role...\n");

  for (const u of newUsers) {
    const hashed = await bcrypt.hash(u.password, SALT_ROUNDS);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashed, name: u.name },
      create: {
        name: u.name,
        email: u.email,
        password: hashed,
        role: u.role,
      },
    });

    console.log(`✅ [${u.role.padEnd(7)}] ${user.name} — ${user.email}`);
  }

  console.log("\n📋 Akun yang bisa digunakan:");
  console.log("┌──────────┬───────────────────────┬──────────────┐");
  console.log("│ Role     │ Email                 │ Password     │");
  console.log("├──────────┼───────────────────────┼──────────────┤");
  for (const u of newUsers) {
    console.log(
      `│ ${u.role.padEnd(8)} │ ${u.email.padEnd(21)} │ ${u.password.padEnd(12)} │`
    );
  }
  console.log("└──────────┴───────────────────────┴──────────────┘");
  console.log("\n🎉 Selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
