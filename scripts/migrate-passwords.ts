/**
 * scripts/migrate-passwords.ts
 *
 * One-time script to re-hash all plain-text passwords already in the database.
 * Run this ONCE on any existing database before deploying the bcrypt auth update:
 *
 *   npx tsx scripts/migrate-passwords.ts
 */
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const SALT_ROUNDS = 12;
const BCRYPT_PREFIX = "$2b$"; // prefix of valid bcrypt hashes

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migratePasswords() {
  console.log("🔐 Starting password migration...\n");

  const users = await prisma.user.findMany({
    select: { id: true, email: true, password: true },
  });

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    // Skip if already a bcrypt hash
    if (user.password.startsWith(BCRYPT_PREFIX)) {
      console.log(`  ⏭  Skipped (already hashed): ${user.email}`);
      skipped++;
      continue;
    }

    const hashed = await bcrypt.hash(user.password, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    console.log(`  ✅ Migrated: ${user.email}`);
    migrated++;
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`   Migrated : ${migrated} users`);
  console.log(`   Skipped  : ${skipped} users (already hashed)`);
}

migratePasswords()
  .catch((e) => {
    console.error("❌ Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
