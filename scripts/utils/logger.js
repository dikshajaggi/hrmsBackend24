import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function logImport({ importType = "generic", fileName, importedBy, recordCount, status, errorSummary }) {
  await prisma.importLog.create({
    data: {
      import_type: importType,
      file_name: fileName,
      imported_by: importedBy,
      record_count: recordCount,
      status,
      error_summary: errorSummary || null,
    },
  });
}