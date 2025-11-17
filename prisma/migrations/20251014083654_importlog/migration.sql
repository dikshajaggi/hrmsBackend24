-- CreateTable
CREATE TABLE "public"."ImportLog" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "imported_by" TEXT NOT NULL,
    "record_count" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);
