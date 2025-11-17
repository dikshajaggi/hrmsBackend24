-- AlterTable
ALTER TABLE "public"."EmployeeJobDetails" ALTER COLUMN "probation_period" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "internship_period" SET DATA TYPE VARCHAR(30);

-- AlterTable
ALTER TABLE "public"."UserPermissions" ADD COLUMN     "can_import_master_data" BOOLEAN NOT NULL DEFAULT false;
