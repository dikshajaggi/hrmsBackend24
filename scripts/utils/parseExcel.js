import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export function parseExcel(fileName) {
  const filePath = path.resolve(fileName);
  const ext = path.extname(filePath).toLowerCase();

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // reading file based on extension .csv, .xlsx, .xls

  let workbook; // has sheets + metadata
  if (ext === ".csv") {
    const csvData = fs.readFileSync(filePath, "utf8"); // reading csv in text format using utf-8
    workbook = XLSX.read(csvData, { type: "string" });
  } else if (ext === ".xlsx" || ext === ".xls") {
    workbook = XLSX.readFile(filePath); // excel file can be read directly without conversion
  } else {
    throw new Error("Unsupported file type. Please upload .xlsx, .xls, or .csv files.");
  }

  const sheetName = workbook.SheetNames[0]; // pick the first sheet --- just normal convention --- we are already giving one sheet so no issue
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" }); //{ defval: "" } if any value is missing adding empty string "" instaed of undefined

  console.log(`📄 Loaded ${data.length} rows from ${fileName}`);
  return data;
}
