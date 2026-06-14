/*
  Warnings:

  - You are about to drop the column `courseId` on the `modules` table. All the data in the column will be lost.
  - Added the required column `chapterId` to the `modules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "modules" DROP CONSTRAINT "modules_courseId_fkey";

-- DropForeignKey
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_courseId_fkey";

-- DropIndex
DROP INDEX "quizzes_courseId_key";

-- AlterTable
ALTER TABLE "certificate_templates" ALTER COLUMN "text" SET DEFAULT 'Sertifikat ini diberikan kepada {{student_name}} atas keberhasilannya menyelesaikan materi {{course_name}} di Nalar Etam.';

-- AlterTable
ALTER TABLE "class_schedules" ADD COLUMN     "classType" TEXT NOT NULL DEFAULT 'ONLINE',
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "modules" DROP COLUMN "courseId",
ADD COLUMN     "chapterId" TEXT NOT NULL,
ALTER COLUMN "youtubeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "chapterId" TEXT,
ADD COLUMN     "moduleId" TEXT;

-- AlterTable
ALTER TABLE "settings" ALTER COLUMN "academyName" SET DEFAULT 'Nalar Etam',
ALTER COLUMN "tagline" SET DEFAULT 'Beralih dari Hafalan ke Penalaran Matematika',
ALTER COLUMN "email" SET DEFAULT 'admin@nalaretam.com',
ALTER COLUMN "verificationUrl" SET DEFAULT 'https://nalaretam.com/verify';

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_widgets" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "htmlCode" TEXT,
    "jsCode" TEXT,
    "cssCode" TEXT,
    "iframeUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_widgets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_widgets" ADD CONSTRAINT "module_widgets_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
