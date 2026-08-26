import * as XLSX from "xlsx";
import * as path from "path";

const filePath = path.resolve(process.cwd(), "data_lama.xlsx");
const workbook = XLSX.readFile(filePath);

// Let's count valid data rows in each PC sheet
["LAB RPL 1", "LAB RPL 2", "LAB RPL 4"].forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  // header is at row 6 (0-indexed 5 or row index with NO)
  const headerIdx = rows.findIndex(r => r.includes("NAMA KOMPUTER") || r.includes("NO"));
  console.log(`Sheet "${sheetName}" header at row index ${headerIdx}:`, rows[headerIdx]);
  const dataRows = rows.slice(headerIdx + 1).filter(r => r[1] && String(r[1]).trim() !== "");
  console.log(`  -> Valid PC count: ${dataRows.length}`);
});
