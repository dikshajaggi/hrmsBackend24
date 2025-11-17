import { PrismaClient } from "@prisma/client";
import { parseExcel } from "./utils/parseExcel.js";
import { logImport } from "./utils/logger.js";
import fs from "fs";

const prisma = new PrismaClient(); // connecting to db
const isDryRun = process.argv.includes("--dry-run"); // testing without writing into db


export const importBranch = async(fileName, importedBy) => {
    const FILE_NAME = fileName;
    const IMPORTED_BY = importedBy;
    const data = parseExcel(FILE_NAME);

    let successCount = 0;
    const errors = [];
    for (const [index, row] of data.entries()) {
        try {
            if (!row.BranchName) {
                errors.push({ row: index + 1, msg: "Missing BranchName" });
                continue;
            }
            const branchData = {
                branch_name: row.BranchName.trim(),
                address: row.Address || null,
            };

            await prisma.branch.upsert({
                where: { branch_name: branchData.branch_name },
                update: branchData,
                create: branchData,
            });

            successCount++;

        } catch (err) {
            console.error(`row ${index + 1}.... failed ${err.message}`);
            errors.push({ row: index + 1, msg: err.message });
        }
    }
    console.log("\n Branch Import Summary:");
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errors.length}`);

    await logImport({
        importType: "branch",
        fileName: FILE_NAME,
        importedBy: IMPORTED_BY,
        recordCount: successCount,
        status: isDryRun ? "DRY_RUN" : "SUCCESS",
        errorSummary: errors.length > 0 ? `${errors.length} rows failed validation` : null,
    });

    if (errors.length > 0) {
        console.warn("Saving import_errors.json...");
        fs.writeFileSync("./data/branch_import_errors.json", JSON.stringify(errors, null, 2));
    }

    await prisma.$disconnect();
    console.log("Import process finished.");
    return { successCount, failedCount: errors.length, errors };
}

export const importProjectSite = async(fileName, importedBy) => {
    const FILE_NAME = fileName;
    const IMPORTED_BY = importedBy;
    const data = parseExcel(FILE_NAME);

    let successCount = 0;
    const errors = [];
    for (const [index, row] of data.entries()) {
        try {
            if (!row.site_name || !row.branch_id) {
                errors.push({ row: index + 1, msg: "Missing site_name or branch_id" });
                continue;
            }
            // foreign key lookup
            const branch = await prisma.branch.findUnique({
                where: { branch_id: row.branch_id },
            });

            if (!branch) {
                errors.push({ row: index + 1, msg: `Branch '${row.branch_id}' not found` });
                continue;
            }

            const siteData = {
                site_name: row.site_name.trim(),
                branch_id: branch.branch_id,
                site_type: row.SiteType?.toLowerCase() || "office",
                address: row.Address || null,
                pincode: row.Pincode?.toString() || null,
            };

            await prisma.projectSite.upsert({
                 where: {
                    branch_id_site_name: {
                    branch_id: siteData.branch_id,
                    site_name: siteData.site_name,
                    },
                },
                update: siteData,
                create: siteData,
            });
            successCount++;
        } catch (err) {
            console.error(`row ${index + 1}.... failed ${err.message}`);
            errors.push({ row: index + 1, msg: err.message });
        }
    }
    console.log("\n Project Site Import Summary:");
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errors.length}`);

    await logImport({
        importType: "projectsite",
        fileName: FILE_NAME,
        importedBy: IMPORTED_BY,
        recordCount: successCount,
        status: isDryRun ? "DRY_RUN" : "SUCCESS",
        errorSummary: errors.length > 0 ? `${errors.length} rows failed validation` : null,
    });

    if (errors.length > 0) {
        console.warn("Saving import_errors.json...");
        fs.writeFileSync("./data/projectsite_import_errors.json", JSON.stringify(errors, null, 2));
    }

    await prisma.$disconnect();
    console.log("Import process finished.");
    return { successCount, failedCount: errors.length, errors };
}

export const importDepartment = async(fileName, importedBy) => {
    const FILE_NAME = fileName;
    const IMPORTED_BY = importedBy;
    const data = parseExcel(FILE_NAME);

    let successCount = 0;
    const errors = [];
    for (const [index, row] of data.entries()) {
        try {
            if (!row.department_name || !row.branch_id) {
                errors.push({ row: index + 1, msg: "Missing department_name or branch_id" });
                continue;
            }
                    
            // foreign key lookup
            const branch = await prisma.branch.findUnique({
                where: { branch_id: row.branch_id},
            });

            if (!branch) {
                errors.push({ row: index + 1, msg: `Branch '${row.branch_id}' not found` });
                continue;
            }

            const deptData = {
                department_name: row.department_name.trim(),
                branch_id: branch.branch_id,
            };

            await prisma.department.upsert({
                where: {
                    branch_id_department_name: {
                    branch_id: deptData.branch_id,
                    department_name: deptData.department_name,
                    },
                },
                update: deptData,
                create: deptData,
            });

            successCount++;
        } catch (err) {
            console.error(`row ${index + 1}.... failed ${err.message}`);
            errors.push({ row: index + 1, msg: err.message });
        }
    }
    console.log("\n Department Import Summary:");
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errors.length}`);

    await logImport({
        importType: "department",
        fileName: FILE_NAME,
        importedBy: IMPORTED_BY,
        recordCount: successCount,
        status: isDryRun ? "DRY_RUN" : "SUCCESS",
        errorSummary: errors.length > 0 ? `${errors.length} rows failed validation` : null,
    });

    if (errors.length > 0) {
        console.warn("Saving import_errors.json...");
        fs.writeFileSync("./data/department_import_errors.json", JSON.stringify(errors, null, 2));
    }

    await prisma.$disconnect();
    console.log("Import process finished.");
    return { successCount, failedCount: errors.length, errors };
}

export const importDesignation = async(fileName, importedBy) => {
    const FILE_NAME = fileName;
    const IMPORTED_BY = importedBy;
    const data = parseExcel(FILE_NAME);

    let successCount = 0;
    const errors = [];
    for (const [index, row] of data.entries()) {
        try {
            if (!row.designation_name || !row.level) {
                errors.push({ row: index + 1, msg: "Missing designation_name or level" });
                continue;
            }

            const desigData = {
                designation_name: row.designation_name.trim(),
                level: row.level.toLowerCase(),
            };

            await prisma.designation.upsert({
                where: { designation_name: desigData.designation_name },
                update: desigData,
                create: desigData,
            });

            successCount++;
        } catch (err) {
            console.error(`row ${index + 1}.... failed ${err.message}`);
            errors.push({ row: index + 1, msg: err.message });
        }
    }
    console.log("\n Designation Import Summary:");
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errors.length}`);

    await logImport({
        importType: "designation",
        fileName: FILE_NAME,
        importedBy: IMPORTED_BY,
        recordCount: successCount,
        status: isDryRun ? "DRY_RUN" : "SUCCESS",
        errorSummary: errors.length > 0 ? `${errors.length} rows failed validation` : null,
    });

    if (errors.length > 0) {
        console.warn("Saving import_errors.json...");
        fs.writeFileSync("./data/designation_import_errors.json", JSON.stringify(errors, null, 2));
    }

    await prisma.$disconnect();
    console.log("Import process finished.");
    return { successCount, failedCount: errors.length, errors };
}