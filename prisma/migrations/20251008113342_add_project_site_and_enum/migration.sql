-- CreateEnum
CREATE TYPE "public"."ProjectSiteType" AS ENUM ('office', 'plant', 'warehouse', 'client_site');

-- AlterTable
ALTER TABLE "public"."Attendance" ADD COLUMN     "project_site_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."EmployeeMaster" ADD COLUMN     "project_site_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."Holiday" ADD COLUMN     "site_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."ProjectSite" (
    "site_id" SERIAL NOT NULL,
    "site_name" VARCHAR(100) NOT NULL,
    "site_type" "public"."ProjectSiteType" NOT NULL DEFAULT 'office',
    "branch_id" INTEGER NOT NULL,
    "address" TEXT,
    "pincode" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProjectSite_pkey" PRIMARY KEY ("site_id")
);

-- CreateTable
CREATE TABLE "public"."_EmployeeMasterToProjectSite" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EmployeeMasterToProjectSite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_HolidayToProjectSite" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_HolidayToProjectSite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSite_branch_id_site_name_key" ON "public"."ProjectSite"("branch_id", "site_name");

-- CreateIndex
CREATE INDEX "_EmployeeMasterToProjectSite_B_index" ON "public"."_EmployeeMasterToProjectSite"("B");

-- CreateIndex
CREATE INDEX "_HolidayToProjectSite_B_index" ON "public"."_HolidayToProjectSite"("B");

-- CreateIndex
CREATE INDEX "EmployeeMaster_project_site_id_idx" ON "public"."EmployeeMaster"("project_site_id");

-- AddForeignKey
ALTER TABLE "public"."ProjectSite" ADD CONSTRAINT "ProjectSite_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EmployeeMasterToProjectSite" ADD CONSTRAINT "_EmployeeMasterToProjectSite_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EmployeeMasterToProjectSite" ADD CONSTRAINT "_EmployeeMasterToProjectSite_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ProjectSite"("site_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HolidayToProjectSite" ADD CONSTRAINT "_HolidayToProjectSite_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Holiday"("holiday_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HolidayToProjectSite" ADD CONSTRAINT "_HolidayToProjectSite_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ProjectSite"("site_id") ON DELETE CASCADE ON UPDATE CASCADE;
