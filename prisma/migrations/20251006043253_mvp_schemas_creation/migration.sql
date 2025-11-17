-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "public"."EmployeeStatus" AS ENUM ('active', 'inactive', 'retired');

-- CreateEnum
CREATE TYPE "public"."EmploymentType" AS ENUM ('permanent', 'contract', 'consultant', 'intern');

-- CreateEnum
CREATE TYPE "public"."Level" AS ENUM ('junior', 'mid', 'senior', 'lead', 'manager', 'director');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('present', 'absent', 'wfh', 'leave');

-- CreateEnum
CREATE TYPE "public"."LeaveRequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateTable
CREATE TABLE "public"."Branch" (
    "branch_id" SERIAL NOT NULL,
    "branch_name" TEXT NOT NULL,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("branch_id")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "department_id" SERIAL NOT NULL,
    "department_name" TEXT NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "public"."Designation" (
    "designation_id" SERIAL NOT NULL,
    "designation_name" TEXT NOT NULL,
    "level" "public"."Level" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("designation_id")
);

-- CreateTable
CREATE TABLE "public"."EmployeeMaster" (
    "employee_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dob" DATE,
    "gender" "public"."Gender",
    "date_of_joining" DATE NOT NULL,
    "date_of_leaving" DATE,
    "status" "public"."EmployeeStatus" NOT NULL DEFAULT 'active',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "department_id" INTEGER,
    "branch_id" INTEGER,
    "designation_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeMaster_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "public"."EmployeePersonalDetails" (
    "employee_id" INTEGER NOT NULL,
    "contact" VARCHAR(15),
    "email" VARCHAR(100),
    "blood_group" VARCHAR(10),
    "father_or_husband_name" TEXT,
    "next_to_kin_name" TEXT,
    "next_to_kin_relation" TEXT,
    "next_to_kin_contact" VARCHAR(15),
    "marital_status" TEXT,
    "anniversary_date" DATE,
    "current_address" TEXT,
    "permanent_address" TEXT,
    "aadhaar_no" VARCHAR(20),
    "pan_no" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePersonalDetails_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "public"."EmployeeJobDetails" (
    "employee_id" INTEGER NOT NULL,
    "employment_type" "public"."EmploymentType" NOT NULL,
    "reporting_manager_id" INTEGER,
    "probation_period" VARCHAR(3),
    "internship_period" VARCHAR(3),
    "notice_period_start_date" DATE,
    "notice_period_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeJobDetails_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "public"."EmployeeDocuments" (
    "document_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "doc_type" TEXT,
    "doc_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeDocuments_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "public"."LeaveType" (
    "leave_type_id" SERIAL NOT NULL,
    "leave_name" VARCHAR(50) NOT NULL,
    "is_half_day_allowed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("leave_type_id")
);

-- CreateTable
CREATE TABLE "public"."LeaveBalance" (
    "employee_id" INTEGER NOT NULL,
    "leave_type_id" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("employee_id","leave_type_id")
);

-- CreateTable
CREATE TABLE "public"."LeaveRequest" (
    "leave_request_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "leave_type_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT,
    "status" "public"."LeaveRequestStatus" NOT NULL DEFAULT 'pending',
    "approved_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("leave_request_id")
);

-- CreateTable
CREATE TABLE "public"."Attendance" (
    "attendance_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL,
    "leave_type_id" INTEGER,
    "half_day" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateTable
CREATE TABLE "public"."Holiday" (
    "holiday_id" SERIAL NOT NULL,
    "branch_id" INTEGER,
    "holiday_date" DATE NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "is_national" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("holiday_id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "permission_id" SERIAL NOT NULL,
    "permission_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "public"."LevelPermission" (
    "level" "public"."Level" NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "LevelPermission_pkey" PRIMARY KEY ("level","permission_id")
);

-- CreateTable
CREATE TABLE "public"."EmployeePermissionOverride" (
    "employee_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "is_granted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePermissionOverride_pkey" PRIMARY KEY ("employee_id","permission_id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "employee_id" INTEGER,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "audit_id" SERIAL NOT NULL,
    "employee_id" INTEGER,
    "action" VARCHAR(200) NOT NULL,
    "entity_name" VARCHAR(100) NOT NULL,
    "entity_id" INTEGER,
    "old_values" JSONB,
    "new_values" JSONB,
    "performed_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("audit_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_branch_name_key" ON "public"."Branch"("branch_name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_branch_id_department_name_key" ON "public"."Department"("branch_id", "department_name");

-- CreateIndex
CREATE UNIQUE INDEX "Designation_designation_name_key" ON "public"."Designation"("designation_name");

-- CreateIndex
CREATE INDEX "EmployeeMaster_department_id_idx" ON "public"."EmployeeMaster"("department_id");

-- CreateIndex
CREATE INDEX "EmployeeMaster_branch_id_idx" ON "public"."EmployeeMaster"("branch_id");

-- CreateIndex
CREATE INDEX "EmployeeMaster_designation_id_idx" ON "public"."EmployeeMaster"("designation_id");

-- CreateIndex
CREATE INDEX "EmployeeMaster_branch_id_department_id_idx" ON "public"."EmployeeMaster"("branch_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePersonalDetails_contact_key" ON "public"."EmployeePersonalDetails"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePersonalDetails_email_key" ON "public"."EmployeePersonalDetails"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePersonalDetails_aadhaar_no_key" ON "public"."EmployeePersonalDetails"("aadhaar_no");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePersonalDetails_pan_no_key" ON "public"."EmployeePersonalDetails"("pan_no");

-- CreateIndex
CREATE INDEX "EmployeeJobDetails_reporting_manager_id_idx" ON "public"."EmployeeJobDetails"("reporting_manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveType_leave_name_key" ON "public"."LeaveType"("leave_name");

-- CreateIndex
CREATE INDEX "LeaveRequest_employee_id_status_idx" ON "public"."LeaveRequest"("employee_id", "status");

-- CreateIndex
CREATE INDEX "LeaveRequest_start_date_end_date_idx" ON "public"."LeaveRequest"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "Attendance_attendance_date_status_idx" ON "public"."Attendance"("attendance_date", "status");

-- CreateIndex
CREATE INDEX "Attendance_employee_id_attendance_date_idx" ON "public"."Attendance"("employee_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_employee_id_attendance_date_key" ON "public"."Attendance"("employee_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_branch_id_holiday_date_key" ON "public"."Holiday"("branch_id", "holiday_date");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_holiday_date_is_national_key" ON "public"."Holiday"("holiday_date", "is_national");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_permission_name_key" ON "public"."Permission"("permission_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employee_id_key" ON "public"."User"("employee_id");

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeMaster" ADD CONSTRAINT "EmployeeMaster_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."Department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeMaster" ADD CONSTRAINT "EmployeeMaster_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."Branch"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeMaster" ADD CONSTRAINT "EmployeeMaster_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "public"."Designation"("designation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeePersonalDetails" ADD CONSTRAINT "EmployeePersonalDetails_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeJobDetails" ADD CONSTRAINT "EmployeeJobDetails_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeJobDetails" ADD CONSTRAINT "EmployeeJobDetails_reporting_manager_id_fkey" FOREIGN KEY ("reporting_manager_id") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeDocuments" ADD CONSTRAINT "EmployeeDocuments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveBalance" ADD CONSTRAINT "LeaveBalance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveBalance" ADD CONSTRAINT "LeaveBalance_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "public"."LeaveType"("leave_type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "public"."LeaveType"("leave_type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "public"."LeaveType"("leave_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Holiday" ADD CONSTRAINT "Holiday_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LevelPermission" ADD CONSTRAINT "LevelPermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."Permission"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeePermissionOverride" ADD CONSTRAINT "EmployeePermissionOverride_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeePermissionOverride" ADD CONSTRAINT "EmployeePermissionOverride_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."Permission"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."EmployeeMaster"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;
