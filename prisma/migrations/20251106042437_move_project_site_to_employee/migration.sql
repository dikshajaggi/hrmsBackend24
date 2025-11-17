/*
  Warnings:

  - You are about to drop the column `project_site_id` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the `_EmployeeMasterToProjectSite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_EmployeeMasterToProjectSite" DROP CONSTRAINT "_EmployeeMasterToProjectSite_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EmployeeMasterToProjectSite" DROP CONSTRAINT "_EmployeeMasterToProjectSite_B_fkey";

-- AlterTable
ALTER TABLE "public"."Attendance" DROP COLUMN "project_site_id";

-- DropTable
DROP TABLE "public"."_EmployeeMasterToProjectSite";

-- AddForeignKey
ALTER TABLE "public"."EmployeeMaster" ADD CONSTRAINT "EmployeeMaster_project_site_id_fkey" FOREIGN KEY ("project_site_id") REFERENCES "public"."ProjectSite"("site_id") ON DELETE SET NULL ON UPDATE CASCADE;
