import { PrismaClient } from "@prisma/client";
import { parseExcel } from "./utils/parseExcel.js";
import { logImport } from "./utils/logger.js";
import fs from "fs";
import { validateAttendance } from "./utils/validators/validateAttendance.js";

const prisma = new PrismaClient(); // connecting to db
const isDryRun = process.argv.includes("--dry-run"); // testing without writing into db


export const importAttendance = async (fileName, importedBy) => {
    const FILE_NAME = fileName;
    const IMPORTED_BY = importedBy;
    console.log(`starting attendance import from ${FILE_NAME}`);
    const data = parseExcel(FILE_NAME);

    let successCount = 0;
    const errors = [];

    for (const [index, row] of data.entries()) {
        try {
            const validationErrors = validateAttendance(row);
            if (validationErrors.length > 0) {
                errors.push({ row: index + 1, errors: validationErrors });
                continue;
            }
            // foreign key lookup
            const employee = await prisma.employeeMaster.findUnique({where: { employee_code: row.EmployeeCode },});
            let leaveType = null;
            if (row.Status?.toLowerCase() === "leave" && row.LeaveType) {
                leaveType = await prisma.leaveType.findUnique({
                where: { leave_name: row.LeaveType },
                });
            }

            if (!employee) {
                errors.push({ row: index + 1, msg: "Invalid Employee Code" });
                continue;
            }

            if (row.Status?.toLowerCase() === "leave" && !leaveType) { // we will check leave type only when the status is leave and not wfh etc
                errors.push({ row: index + 1, msg: "Invalid Leave Type" });
                continue;
            }

             const attendanceData = {
                employee_id: employee.employee_id,
                attendance_date: new Date(row.Date),
                status: row.Status.toLowerCase(),
                leave_type_id: leaveType?.leave_type_id || null,
                half_day: row.HalfDay === true || row.HalfDay === "true" ? true : false,
                remarks: row.Remarks || null,
            };

            await prisma.attendance.upsert({
                where: {
                employee_id_attendance_date: {
                    employee_id: employee.employee_id,
                    attendance_date: new Date(row.Date),
                },
                },
                update: attendanceData,
                create: attendanceData,
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
        errorSummary: errors.length > 0 ? `${errors.length} rows failed validation` : null,
    });

    if (errors.length > 0) {
        console.warn("Saving import_errors.json...");
        fs.writeFileSync("./data/attendance_import_errors.json", JSON.stringify(errors, null, 2));
    }

    await prisma.$disconnect();
    console.log("Import process finished.");
    return { successCount, failedCount: errors.length, errors };

}