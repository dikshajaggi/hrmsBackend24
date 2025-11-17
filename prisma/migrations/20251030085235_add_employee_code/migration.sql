/*
  Warnings:

  - A unique constraint covering the columns `[department_name]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[site_name]` on the table `ProjectSite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Department_department_name_key" ON "public"."Department"("department_name");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSite_site_name_key" ON "public"."ProjectSite"("site_name");
