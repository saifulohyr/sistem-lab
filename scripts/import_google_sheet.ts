import * as XLSX from "xlsx";
import * as path from "path";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function parseCondition(raw: string): { condition: string; note: string } {
  if (!raw) return { condition: "BAIK", note: "" };
  const str = String(raw).trim().toUpperCase();
  if (str.includes("RUSAK BERAT")) return { condition: "RUSAK_BERAT", note: raw };
  if (str.includes("RUSAK") || str.includes("KURANG BAIK") || str.includes("NO MOUSE")) {
    return { condition: "RUSAK_RINGAN", note: raw };
  }
  return { condition: "BAIK", note: raw.toLowerCase().includes("baik") ? "" : raw };
}

async function main() {
  console.log("🚀 Starting import from Google Sheet (data_lama.xlsx)...");

  // 1. Get or create location
  const location = await prisma.location.upsert({
    where: { name: "Gedung Utama" },
    update: {},
    create: { name: "Gedung Utama", address: "Lantai 2" },
  });

  // 2. Ensure rooms exist
  const roomDefs = [
    { id: "lab-rpl-1", name: "Lab RPL 1", capacity: 36 },
    { id: "lab-rpl-2", name: "Lab RPL 2", capacity: 36 },
    { id: "lab-rpl-3", name: "Lab RPL 3", capacity: 36 },
    { id: "lab-rpl-4", name: "Lab RPL 4", capacity: 36 },
    { id: "gudang-lab", name: "Gudang Lab", capacity: null },
  ];

  for (const r of roomDefs) {
    await prisma.room.upsert({
      where: { id: r.id },
      update: { name: r.name },
      create: { id: r.id, name: r.name, locationId: location.id, capacity: r.capacity },
    });
  }

  // 3. Ensure Categories exist
  const categoriesList = [
    { name: "Komputer", icon: "Monitor", description: "PC Desktop & Workstation" },
    { name: "Monitor", icon: "Monitor", description: "Monitor LCD/LED" },
    { name: "Keyboard", icon: "Keyboard", description: "Keyboard USB/Wireless" },
    { name: "Mouse", icon: "Mouse", description: "Mouse Optik/Wireless" },
    { name: "Komponen & Sparepart", icon: "Cpu", description: "RAM, SSD, HDD, PSU, CMOS, Motherboard" },
    { name: "Jaringan", icon: "Wifi", description: "Router, HUB, Switch, Kabel LAN, RJ45" },
    { name: "Peralatan Lab", icon: "Printer", description: "Printer, Proyektor, Scanner" },
    { name: "Tools & Perlengkapan", icon: "Wrench", description: "Tool Kit, Krimping, Tester, Thermal" },
    { name: "Lainnya", icon: "Package", description: "Barang umum lainnya" },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categoriesList) {
    const cat = await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
    catMap[c.name] = cat.id;
  }

  // 4. Get Toolman user for history logging
  const toolman = await prisma.user.findFirst({ where: { role: "TOOLMAN" } }) 
    || await prisma.user.findFirst();

  const filePath = path.resolve(process.cwd(), "data_lama.xlsx");
  const workbook = XLSX.readFile(filePath);

  // 5. Import PC Sheets (Lab RPL 1, Lab RPL 2, Lab RPL 4)
  const pcSheets = [
    { sheetName: "LAB RPL 1", roomId: "lab-rpl-1", prefix: "PC-RPL1" },
    { sheetName: "LAB RPL 2", roomId: "lab-rpl-2", prefix: "PC-RPL2" },
    { sheetName: "LAB RPL 4", roomId: "lab-rpl-4", prefix: "PC-RPL4" },
  ];

  let totalPcImported = 0;

  for (const pcSheet of pcSheets) {
    const sheet = workbook.Sheets[pcSheet.sheetName];
    if (!sheet) continue;

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const headerIdx = rows.findIndex(r => r.includes("NAMA KOMPUTER") || r.includes("NO"));
    if (headerIdx === -1) continue;

    const dataRows = rows.slice(headerIdx + 1).filter(r => r[1] && String(r[1]).trim() !== "");

    console.log(`\n📦 Importing ${dataRows.length} PCs from ${pcSheet.sheetName}...`);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const no = row[0] || (i + 1);
      const rawName = String(row[1]).trim();
      const os = String(row[2]).trim();
      const ram = String(row[3]).trim();
      const mobo = String(row[4]).trim();
      const processor = String(row[5]).trim();
      const bios = String(row[6]).trim();
      const biosMode = String(row[7]).trim();
      const storage = String(row[8]).trim();
      const rawKondisi = String(row[10]).trim();

      const { condition, note } = parseCondition(rawKondisi);
      const code = `${pcSheet.prefix}-${String(no).padStart(3, "0")}`;

      const inventory = await prisma.inventory.upsert({
        where: { code },
        update: {
          name: rawName,
          categoryId: catMap["Komputer"],
          roomId: pcSheet.roomId,
          position: `Meja ${no}`,
          condition,
          note: note || undefined,
          status: condition === "RUSAK_BERAT" ? "PERBAIKAN" : "AKTIF",
        },
        create: {
          code,
          name: rawName,
          categoryId: catMap["Komputer"],
          type: "Desktop PC",
          roomId: pcSheet.roomId,
          position: `Meja ${no}`,
          condition,
          status: condition === "RUSAK_BERAT" ? "PERBAIKAN" : "AKTIF",
          quantity: 1,
          note: note || "Import dari Laporan Lab RPL",
        },
      });

      // Upsert Specs
      const specs = [
        { key: "Processor", value: processor },
        { key: "RAM", value: ram },
        { key: "Storage", value: storage },
        { key: "OS", value: os },
        { key: "Motherboard", value: mobo },
        { key: "BIOS", value: bios },
        { key: "BIOS Mode", value: biosMode },
      ].filter(s => s.value && s.value !== "");

      for (const spec of specs) {
        await prisma.inventorySpec.upsert({
          where: {
            inventoryId_key: { inventoryId: inventory.id, key: spec.key },
          },
          update: { value: spec.value },
          create: {
            inventoryId: inventory.id,
            key: spec.key,
            value: spec.value,
          },
        });
      }

      totalPcImported++;
    }
  }

  console.log(`\n✅ Total PC Imported: ${totalPcImported}`);

  // 6. Import "Daftar Rekap Barang" (Komponen & Alat)
  const rekapSheet = workbook.Sheets["Daftar Rekap Barang"];
  if (rekapSheet) {
    const rows: any[] = XLSX.utils.sheet_to_json(rekapSheet, { header: 1, defval: "" });
    const headerIdx = rows.findIndex(r => r.includes("Kode Barang") || r.includes("Nama Barang"));
    
    if (headerIdx !== -1) {
      const dataRows = rows.slice(headerIdx + 1).filter(r => r[0] && String(r[0]).trim().startsWith("RPL-"));
      console.log(`\n📦 Importing ${dataRows.length} Items from Daftar Rekap Barang...`);

      for (const row of dataRows) {
        const code = String(row[0]).trim();
        const rawName = String(row[1]).trim();
        const stokAkhir = parseInt(row[5]) || parseInt(row[2]) || 0;
        const ket = String(row[7] || "").trim();

        // Categorize automatically
        let catName = "Lainnya";
        const upper = rawName.toUpperCase();
        if (upper.includes("MONITOR")) catName = "Monitor";
        else if (upper.includes("MOUSE")) catName = "Mouse";
        else if (upper.includes("KEYBOARD")) catName = "Keyboard";
        else if (upper.includes("RAM") || upper.includes("SSD") || upper.includes("HDD") || upper.includes("POWER SUPLAY") || upper.includes("CIMOS") || upper.includes("FLASHDISK")) catName = "Komponen & Sparepart";
        else if (upper.includes("ROUTER") || upper.includes("HUB") || upper.includes("RJ45") || upper.includes("KABEL")) catName = "Jaringan";
        else if (upper.includes("PROYEKTOR") || upper.includes("PRINTER")) catName = "Peralatan Lab";
        else if (upper.includes("TOOL") || upper.includes("THERMAL") || upper.includes("BATERAI") || upper.includes("TINTA") || upper.includes("STIKER")) catName = "Tools & Perlengkapan";

        // If it's CPU, it's already represented in individual PC sheets, but let's check
        if (upper === "CPU") continue;

        await prisma.inventory.upsert({
          where: { code },
          update: {
            name: rawName,
            categoryId: catMap[catName] || catMap["Lainnya"],
            quantity: stokAkhir,
            note: ket || undefined,
          },
          create: {
            code,
            name: rawName,
            categoryId: catMap[catName] || catMap["Lainnya"],
            roomId: "gudang-lab",
            position: "Gudang / Rak Komponen",
            condition: "BAIK",
            status: "AKTIF",
            quantity: stokAkhir,
            note: ket || "Import dari Daftar Rekap Barang",
          },
        });
      }
    }
  }

  console.log("\n🎉 IMPORT DATA COMPLETED SUCCESSFULLY!");
}

main()
  .catch(e => {
    console.error("❌ Import error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
