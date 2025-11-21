/*
  Warnings:

  - The values [absent,leave] on the enum `AttendanceStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AttendanceStatus_new" AS ENUM ('present', 'holiday', 'saturday_off', 'casual_leave', 'half_day_casual_1', 'half_day_casual_2', 'sick_leave', 'sick_leave_1', 'sick_leave_2', 'wfh', 'comp_off');
ALTER TABLE "public"."Attendance" ALTER COLUMN "status" TYPE "public"."AttendanceStatus_new" USING ("status"::text::"public"."AttendanceStatus_new");
ALTER TYPE "public"."AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "public"."AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "public"."AttendanceStatus_old";
COMMIT;

-- CreateTable
CREATE TABLE "public"."Saturdayoff" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER,
    "site_id" INTEGER,
    "off_saturdays" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Saturdayoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Saturdayoffoverride" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER,
    "site_id" INTEGER,
    "override_date" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Saturdayoffoverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Saturdayoff_branch_id_site_id_key" ON "public"."Saturdayoff"("branch_id", "site_id");

-- CreateIndex
CREATE UNIQUE INDEX "Saturdayoffoverride_branch_id_site_id_override_date_key" ON "public"."Saturdayoffoverride"("branch_id", "site_id", "override_date");

-- AddForeignKey
ALTER TABLE "public"."Saturdayoff" ADD CONSTRAINT "Saturdayoff_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Saturdayoff" ADD CONSTRAINT "Saturdayoff_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."ProjectSite"("site_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Saturdayoffoverride" ADD CONSTRAINT "Saturdayoffoverride_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Saturdayoffoverride" ADD CONSTRAINT "Saturdayoffoverride_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."ProjectSite"("site_id") ON DELETE CASCADE ON UPDATE CASCADE;
