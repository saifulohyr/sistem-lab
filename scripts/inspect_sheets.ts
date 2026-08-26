import * as XLSX from "xlsx";
import * as path from "path";

const filePath = path.resolve(process.cwd(), "data_lama.xlsx");
const workbook = XLSX.readFile(filePath);

for (const sheetName of workbook.SheetNames) {
  console.log(`\n======================================================`);
  console.log(`=== SHEET: "${sheetName}" ===`);
  console.log(`======================================================`);
  const sheet = workbook.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const nonEmptyRows = rows.filter(r => r.some((c: any) => c !== ""));
  
  nonEmptyRows.forEach((r, idx) => {
    console.log(`[${idx + 1}]`, JSON.stringify(r));
  });
}
