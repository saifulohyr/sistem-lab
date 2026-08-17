import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "dev.db"); // root/dev.db
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding LABMUMA database...\n");

  // ─── Users ────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@labmuma.id" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@labmuma.id",
      password: "admin123",
      role: "ADMIN",
    },
  });

  const toolman = await prisma.user.upsert({
    where: { email: "toolman@labmuma.id" },
    update: {},
    create: {
      name: "Toolman RPL",
      email: "toolman@labmuma.id",
      password: "toolman123",
      role: "TOOLMAN",
    },
  });

  const kepalaLab = await prisma.user.upsert({
    where: { email: "kepalalab@labmuma.id" },
    update: {},
    create: {
      name: "Kepala Lab RPL",
      email: "kepalalab@labmuma.id",
      password: "kepalalab123",
      role: "KEPALA_LAB",
    },
  });

  const guru = await prisma.user.upsert({
    where: { email: "guru@labmuma.id" },
    update: {},
    create: {
      name: "Guru RPL",
      email: "guru@labmuma.id",
      password: "guru123",
      role: "GURU",
    },
  });

  console.log("✅ Users created:", { admin: admin.name, toolman: toolman.name, kepalaLab: kepalaLab.name, guru: guru.name });

  // ─── Locations ────────────────────────────────────────────
  const gedungUtama = await prisma.location.upsert({
    where: { name: "Gedung Utama" },
    update: {},
    create: {
      name: "Gedung Utama",
      address: "Lantai 2",
    },
  });

  console.log("✅ Locations created");

  // ─── Rooms ────────────────────────────────────────────────
  const rooms = [
    { name: "Lab RPL 1", capacity: 36 },
    { name: "Lab RPL 2", capacity: 36 },
    { name: "Lab RPL 3", capacity: 36 },
    { name: "Gudang Lab", capacity: null },
  ];

  for (const room of rooms) {
    const roomId = room.name.toLowerCase().replace(/\s/g, "-");
    await prisma.room.upsert({
      where: { id: roomId },
      update: {},
      create: {
        id: roomId,
        name: room.name,
        locationId: gedungUtama.id,
        capacity: room.capacity,
      },
    });
  }

  console.log("✅ Rooms created:", rooms.map((r) => r.name).join(", "));

  // ─── Categories ───────────────────────────────────────────
  const categories = [
    { name: "Komputer", icon: "Monitor", description: "PC Desktop, Laptop" },
    { name: "Monitor", icon: "Monitor", description: "Monitor LCD/LED" },
    { name: "Keyboard", icon: "Keyboard", description: "Keyboard" },
    { name: "Mouse", icon: "Mouse", description: "Mouse" },
    { name: "Printer", icon: "Printer", description: "Printer, Scanner" },
    { name: "Jaringan", icon: "Wifi", description: "Router, Switch, AP" },
    { name: "Proyektor", icon: "Projector", description: "Proyektor & Layar" },
    { name: "Furniture", icon: "Armchair", description: "Meja, Kursi, Rak" },
    { name: "Elektronik", icon: "Zap", description: "AC, Lampu, dll" },
    { name: "Aksesoris", icon: "Headphones", description: "Headset, Webcam, dll" },
    { name: "Storage", icon: "HardDrive", description: "HDD, SSD, Flash Drive" },
    { name: "Lainnya", icon: "Package", description: "Barang lainnya" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log("✅ Categories created:", categories.length);

  // ─── Brands ───────────────────────────────────────────────
  const brands = [
    "ASUS", "Acer", "Lenovo", "HP", "Dell", "Samsung",
    "LG", "ViewSonic", "BenQ", "Logitech", "Rexus",
    "TP-Link", "Cisco", "Mikrotik", "Epson", "Canon",
    "Intel", "AMD", "Kingston", "Western Digital",
    "Seagate", "Corsair", "Generic",
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { name: brand },
      update: {},
      create: { name: brand },
    });
  }

  console.log("✅ Brands created:", brands.length);

  // ─── Sample Inventory ─────────────────────────────────────
  const komputer = await prisma.category.findUnique({ where: { name: "Komputer" } });
  const asus = await prisma.brand.findUnique({ where: { name: "ASUS" } });
  const labRPL1 = await prisma.room.findUnique({ where: { id: "lab-rpl-1" } });

  if (komputer && asus && labRPL1) {
    for (let i = 1; i <= 10; i++) {
      const code = `PC-RPL1-${String(i).padStart(3, "0")}`;
      const pc = await prisma.inventory.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name: `PC ${String(i).padStart(2, "0")}`,
          categoryId: komputer.id,
          brandId: asus.id,
          type: "Desktop",
          roomId: labRPL1.id,
          position: `Meja ${i}`,
          condition: i <= 7 ? "BAIK" : i <= 9 ? "RUSAK_RINGAN" : "RUSAK_BERAT",
          status: i <= 7 ? "AKTIF" : "PERBAIKAN",
          year: 2023,
          source: "DIPA",
          price: 8500000,
        },
      });

      // Add specs for each PC
      const specs = [
        { key: "Processor", value: "Intel Core i5-12400" },
        { key: "RAM", value: "8 GB DDR4" },
        { key: "Storage", value: "SSD 256 GB" },
        { key: "VGA", value: "Intel UHD 730" },
        { key: "Monitor", value: `Monitor 22" LED` },
        { key: "OS", value: "Windows 11 Pro" },
      ];

      for (const spec of specs) {
        await prisma.inventorySpec.upsert({
          where: {
            inventoryId_key: { inventoryId: pc.id, key: spec.key },
          },
          update: {},
          create: {
            inventoryId: pc.id,
            ...spec,
          },
        });
      }

      // Add history
      await prisma.inventoryHistory.create({
        data: {
          inventoryId: pc.id,
          action: "PENDATAAN",
          description: `Pendataan awal ${code}`,
          userId: toolman.id,
        },
      });
    }

    console.log("✅ Sample inventories created: 10 PCs in Lab RPL 1");
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Login accounts:");
  console.log("   Admin    : admin@labmuma.id / admin123");
  console.log("   Toolman  : toolman@labmuma.id / toolman123");
  console.log("   Kepala Lab: kepalalab@labmuma.id / kepalalab123");
  console.log("   Guru     : guru@labmuma.id / guru123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
