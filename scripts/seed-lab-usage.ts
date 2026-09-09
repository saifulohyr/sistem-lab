/**
 * Seed data pemakaian lab hari ini
 * Jalankan: npx tsx scripts/seed-lab-usage.ts
 */
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Seeding data pemakaian lab...\n");

  // Get staff user for userId
  const staffUser = await prisma.user.findFirst({ where: { role: "TOOLMAN" } })
    || await prisma.user.findFirst({ where: { role: "ADMIN" } })
    || await prisma.user.findFirst();

  if (!staffUser) {
    throw new Error("No user found. Run seed first.");
  }

  // Today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Clear existing records for today
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const deleted = await prisma.labUsage.deleteMany({
    where: { date: { gte: today, lt: tomorrow } },
  });
  console.log(`🗑️  Cleared ${deleted.count} existing records for today.\n`);

  // Data pemakaian hari Jumat 4 September 2026
  const usageData = [
    {
      roomId: "lab-rpl-1",
      startPeriod: 1,
      endPeriod: 4,
      startTime: "07:30",
      endTime: "09:45",
      subject: "Praktikum RPL",
      teacher: "Guru Pengajar",
      className: "XII RPL 3",
    },
    {
      roomId: "lab-rpl-3",
      startPeriod: 1,
      endPeriod: 7,
      startTime: "07:30",
      endTime: "11:15",
      subject: "Praktikum RPL",
      teacher: "Guru Pengajar",
      className: "XII RPL 4",
    },
    {
      roomId: "lab-rpl-2",
      startPeriod: 4,
      endPeriod: 7,
      startTime: "09:15",
      endTime: "11:15",
      subject: "Praktikum RPL",
      teacher: "Guru Pengajar",
      className: "X RPL 6",
    },
    // Lab RPL 4 kosong — tidak ada record
  ];

  for (const usage of usageData) {
    const record = await prisma.labUsage.create({
      data: {
        ...usage,
        date: today,
        userId: staffUser.id,
      },
    });
    console.log(`✅ ${usage.className} → Lab ${usage.roomId} (Jam ${usage.startPeriod}–${usage.endPeriod})`);
  }

  console.log("\n🎉 Seed pemakaian lab selesai!");
  console.log("   Lab RPL 4 → Kosong (tidak ada record)");
}

main()
  .catch(e => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
