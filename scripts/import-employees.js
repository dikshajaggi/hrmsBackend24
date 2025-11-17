import { PrismaClient } from "@prisma/client";
import { parseExcel } from "./utils/parseExcel.js";
import { logImport } from "./utils/logger.js";
import fs from "fs";
import { validateEmployee } from "./utils/validators/validateEmployee.js";
import { normalizeGender } from "./utils/basic.js";

const prisma = new PrismaClient(); // connecting to db


const isDryRun = process.argv.includes("--dry-run"); // testing without writing into db

export async function importEmployees(fileName, importedBy) {
  const FILE_NAME = fileName;
  const IMPORTED_BY = importedBy;
  console.log(`starting employee import from ${FILE_NAME}`);
  const data = parseExcel(FILE_NAME);

  let successCount = 0;
  const errors = [];

  // implementing transaction in per-row way to prevent the loss of successful rows written to db before the failure of a new row
  // also----one bad row never breaks the entire file
  // db never ends up with half-filled employee data


  // data returned will be normal array of objects and data.entries will make it like this--->
    //   [
    //   [0, { Name: "Mona", Department: "HR", ... }],
    //   [1, { Name: "Diksha", Department: "IT", ... }],
    // ]
  

  for (const [index, row] of data.entries()) {
    try {
      // 1️ validate data
      const { master, personal, job, docs } = validateEmployee(row);
      const allErrors = [...master, ...personal, ...job, ...docs];
      if (allErrors.length > 0) {
        errors.push({
          rowNumber: index + 1,
          errors: { master, personal, job, docs },
        });
        continue;
      }

      // 2️ lookup foreign keys to find the id associated with each branch, dept etc to use those ids in the emp tables
      const department = await prisma.department.findUnique({ where: { department_name: row.Department } })
      const branch = await prisma.branch.findUnique({ where: { branch_name: row.Branch } })
      const designation = await prisma.designation.findUnique({ where: { designation_name: row.Designation } })
      const project_site = await prisma.projectSite.findUnique({ where: { site_name: row.ProjectSite } })

      if (!department || !branch || !designation || !project_site) {
        errors.push({ rowNumber: index + 1, errors: ["invalid department/branch/designation/project_site"] })
        continue
      }

      // 3 prepare employee data
      const masterData = {
        employee_code: row.EmployeeCode,
        name: row.Name,
        gender: normalizeGender(row.Gender) || null,
        dob: row.DOB ? new Date(row.DOB) : null,
        date_of_joining: row.DOJ ? new Date(row.DOJ) : null,
        date_of_leaving: row.DOL ? new Date(row.DOL) : null,
        department_id: department?.department_id,  // ----here are the ids being used ---collected from FK lookups
        branch_id: branch?.branch_id,  // ----here are the ids being used ---collected from FK lookups
        designation_id: designation?.designation_id,  // ----here are the ids being used ---collected from FK lookups
        project_site_id: project_site?.site_id || null,
      };

      const personalData = {
        email: row.Email,
        contact: row.Contact?.toString() || null,
        blood_group: row["Blood Group"] || null,
        aadhaar_no: row.Aadhaar?.toString() || null,
        pan_no: row.PAN?.toString() || null,
        father_or_husband_name: row["Father/Husband Name"] || null,
        marital_status: row["Marital Status"] || null,
        current_address: row["Current Address"] || null,
        permanent_address: row["Permanent Address"] || null,
      };

      const jobData = {
        employment_type: row["Employment Type"] || "permanent",
        probation_period: row["Probation Period"] || null,
        internship_period: row["Internship Period"] || null,
        notice_period_days: row["Notice Period Days"] ? Number(row["Notice Period Days"]) : null,
      };

      const documentData = {
        doc_type: row["Document Type"] || null,
        doc_path: row["Document Path"] || null,
      };

      // 4️ if dry run....just log
      if (isDryRun) {
        console.log(`(Dry Run) Row ${index + 1}:`, masterData);
        successCount++;
        continue;
      }

      // ----------------- UPSERT MEANS ------------------------------
      // If an employee with that employee_code exists → update it.    
      // Else → create it and return the newly created record.
      // It also immediately returns the record (with its auto-generated ID — employee_id). so we can use this id ( master.id ) in other tables---


      // 5️ insert all related data transactionally
      await prisma.$transaction(async (tx) => {
        // upsert EmployeeMaster
        const master = await tx.employeeMaster.upsert({
          where: { employee_code: row.EmployeeCode },
          update: masterData,
          create: masterData,
        });

        // upsert EmployeePersonalDetails
        await tx.employeePersonalDetails.upsert({
          where: { employee_id: master.employee_id },
          update: personalData,
          create: { ...personalData, employee_id: master.employee_id },
        });

        // upsert EmployeeJobDetails
        await tx.employeeJobDetails.upsert({
          where: { employee_id: master.employee_id },
          update: jobData,
          create: { ...jobData, employee_id: master.employee_id },
        });

        // optional........ EmployeeDocuments
        if (documentData.doc_type && documentData.doc_path) {
          await tx.employeeDocuments.create({
            data: { ...documentData, employee_id: master.employee_id },
          });
        }
      });

      console.log(` Row ${index + 1}: Imported ${row.Name}`);
      successCount++;
    } catch (err) {
      console.error(`Row ${index + 1} failed: ${err.message}`);
      errors.push({ rowNumber: index + 1, error: err.message });
    }
  }

  // 6️ log summary
  console.log("\n Import Summary:");
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errors.length}`);

  await logImport({
    fileName: FILE_NAME,
    importedBy: IMPORTED_BY,
    recordCount: successCount,
    status: isDryRun ? "DRY_RUN" : "SUCCESS",
    errorSummary: errors.length > 0 ? `${errors.length} rows failed validation` : null,
  });

  if (errors.length > 0) {
    console.warn("Saving import_errors.json...");
    fs.writeFileSync("./data/import_errors.json", JSON.stringify(errors, null, 2));
  }

  await prisma.$disconnect();
  console.log("Import process finished.");
  return { successCount, failedCount: errors.length, errors };
}


//--------------------- this is for CLI if user wants to use terminal to upload files manually------------------------------------
// const fileName = process.argv[2]; // ..like path to excel/csv
// const importedBy = process.argv[3] || "system";
// if (!fileName) {
//   console.error("Usage: node importEmployees.js <filePath> [importedBy]");
//   process.exit(2);
// }

// importEmployees(fileName, importedBy).catch(async (err) => {
//   console.error("Fatal import error:", err);
//   try {
//     await logImport({
//       importType: "employee",
//       fileName: fileName,
//       importedBy: importedBy,
//       recordCount: 0,
//       status: "FAILED",
//       errorSummary: err.message,
//     });
//   } catch (logErr) {
//     console.error("Failed to write import log:", logErr);
//   } finally { 
//     await prisma.$disconnect();
//     process.exit(1);
//   }
// });