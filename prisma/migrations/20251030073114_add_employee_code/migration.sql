/*
  Warnings:

  - A unique constraint covering the columns `[employee_code]` on the table `EmployeeMaster` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employee_code` to the `EmployeeMaster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."EmployeeMaster" ADD COLUMN     "employee_code" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."UserPermissions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "can_import_employees" BOOLEAN NOT NULL DEFAULT false,
    "can_import_attendance" BOOLEAN NOT NULL DEFAULT false,
    "can_import_salary" BOOLEAN NOT NULL DEFAULT false,
    "can_import_holidays" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeMaster_employee_code_key" ON "public"."EmployeeMaster"("employee_code");

-- AddForeignKey
ALTER TABLE "public"."UserPermissions" ADD CONSTRAINT "UserPermissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
