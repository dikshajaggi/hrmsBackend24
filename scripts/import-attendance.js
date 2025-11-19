import { PrismaClient } from "@prisma/client";
import { parseExcel } from "./utils/parseExcel.js";
import { logImport } from "./utils/logger.js";
import fs from "fs";
import { validateAttendance } from "./utils/validators/validateAttendance.js";

const prisma = new PrismaClient();
const isDryRun = process.argv.includes("--dry-run");

// ⭐ Mapping frontend initials → Prisma enum values
const STATUS_MAP = {
  "P": "present",
  "H": "holiday",
  "S": "saturday_off",

  "L": "casual_leave",
  "L1": "half_day_casual_1",
  "L2": "half_day_casual_2",

  "SL": "sick_leave",
  "SL1": "sick_leave_1",
  "SL2": "sick_leave_2",

  "W": "wfh",
  "C": "comp_off"
};

export const importAttendance = async (fileName, importedBy) => {
  const FILE_NAME = fileName;
  const IMPORTED_BY = importedBy;
  console.log(`starting attendance import from ${FILE_NAME}`);

  const data = parseExcel(FILE_NAME);
  let successCount = 0;
  const errors = [];

  for (const [index, row] of data.entries()) {
    try {
      // 1) Validate initials (L, S, H etc)
      const validationErrors = validateAttendance(row);
      if (validationErrors.length > 0) {
        errors.push({ row: index + 1, errors: validationErrors });
        continue;
      }

      // 2) Lookup employee
      const employee = await prisma.employeeMaster.findUnique({
        where: { employee_code: row.EmployeeCode }
      });

      if (!employee) {
        errors.push({ row: index + 1, msg: "Invalid Employee Code" });
        continue;
      }

      // 3) Convert status initial → enum
      const mappedStatus = STATUS_MAP[row.Status];

      if (!mappedStatus) {
        errors.push({
          row: index + 1,
          msg: `Invalid Status '${row.Status}' — must be one of: ${Object.keys(STATUS_MAP).join(", ")}`
        });
        continue;
      }

      // 4) Prepare attendance data
      const attendanceData = {
        employee_id: employee.employee_id,
        attendance_date: new Date(row.Date),
        status: mappedStatus, // ⭐ Using Prisma enum now
        half_day: !!(row.HalfDay === true || row.HalfDay === "true"),
        remarks: row.Remarks || null,
        leave_type_id: null   // optional
      };

      // 5) Save or update
      await prisma.attendance.upsert({
        where: {
          employee_id_attendance_date: {
            employee_id: employee.employee_id,
            attendance_date: new Date(row.Date),
          }
        },
        update: attendanceData,
        create: attendanceData
      });

      successCount++;
      console.log(`row ${index + 1}... imported for ${row.EmployeeCode}`);

    } catch (err) {
      console.error(`row ${index + 1}.... failed ${err.message}`);
      errors.push({ row: index + 1, msg: err.message });
    }
  }

  console.log("\n Attendance Import Summary:");
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errors.length}`);

  await logImport({
    importType: "attendance",
    fileName: FILE_NAME,
    importedBy: IMPORTED_BY,
    recordCount: successCount,
    status: isDryRun ? "DRY_RUN" : "SUCCESS",
    errorSummary: errors.length > 0 ? `${errors.length} rows failed validation` : null
  });

  if (errors.length > 0) {
    console.warn("Saving attendance_import_errors.json...");
    fs.writeFileSync("./data/attendance_import_errors.json", JSON.stringify(errors, null, 2));
  }

  await prisma.$disconnect();

  console.log("Attendance import finished.");
  return { successCount, failedCount: errors.length, errors };
};
