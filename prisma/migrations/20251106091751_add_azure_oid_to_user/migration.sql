/*
  Warnings:

  - A unique constraint covering the columns `[azure_oid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "azure_oid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_azure_oid_key" ON "public"."User"("azure_oid");
