import prisma from "../db/db.config.js"
import { parseExcel } from "./utils/parseExcel.js";
import { logImport } from "./utils/logger.js";
import fs from "fs";

const isDryRun = process.argv.includes("--dry-run");

export const importHoliday = async (fileName, importedBy) => {
  const FILE_NAME = fileName;
  const IMPORTED_BY = importedBy;

  const data = parseExcel(FILE_NAME);

  let successCount = 0;
  const errors = [];

  for (const [index, row] of data.entries()) {
    try {
      if (!row.date || !row.description) {
        errors.push({ row: index + 1, msg: "Missing date or description" });
        continue;
      }

      // 🟢 FIX: Excel Serial Number support  
      let holiday_date;
      if (typeof row.date === "number") {
        holiday_date = new Date((row.date - 25569) * 86400 * 1000);
      } else {
        holiday_date = new Date(row.date);
      }

      if (isNaN(holiday_date)) {
        errors.push({ row: index + 1, msg: "Invalid date format" });
        continue;
      }

      const description = row.description.trim();
      const is_national =
        row.is_national?.toString().toLowerCase() === "true" ? true : false;

      const branch_id = row.branch_id ? Number(row.branch_id) : null;
      const site_id = row.site_id ? Number(row.site_id) : null;

      // 🔍 Validate foreign keys
      if (branch_id) {
        const branch = await prisma.branch.findUnique({ where: { branch_id } });
        if (!branch) {
          errors.push({ row: index + 1, msg: `Branch '${branch_id}' not found` });
          continue;
        }
      }

      if (site_id) {
        const site = await prisma.projectSite.findUnique({ where: { site_id } });
        if (!site) {
          errors.push({ row: index + 1, msg: `Project site '${site_id}' not found` });
          continue;
        }
      }

      const holidayData = {
        holiday_date,
        description,
        is_national,
        branch_id,
        site_id,
      };

      // 🟢 FIX: Use proper unique key based on whether branch_id exists
      const whereClause = branch_id
        ? { branch_id_holiday_date: { branch_id, holiday_date } }
        : { holiday_date_is_national: { holiday_date, is_national } };

      const saved = await prisma.holiday.upsert({
        where: whereClause,
        update: holidayData,
        create: holidayData,
      });

      if (saved) successCount++; // 🟢 FIX: Only count actual inserts/updates

    } catch (err) {
      errors.push({ row: index + 1, msg: err.message });
    }
  }

  await logImport({
    importType: "holiday",
    fileName: FILE_NAME,
    importedBy: IMPORTED_BY,
    recordCount: successCount,
    status: isDryRun ? "DRY_RUN" : "SUCCESS",
    errorSummary: errors.length ? `${errors.length} rows failed validation` : null,
  });

  if (errors.length) {
    fs.writeFileSync(
      "./data/holiday_import_errors.json",
      JSON.stringify(errors, null, 2)
    );
  }

  await prisma.$disconnect();

  return { successCount, failedCount: errors.length, errors };
};
