/*
  Warnings:

  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimeBlock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_timeBlockId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_userId_fkey";

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "TimeBlock";

-- CreateTable
CREATE TABLE "Matricula" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cursoId" TEXT,
    "montoPagado" DECIMAL(10,2) NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "estadoPago" TEXT NOT NULL DEFAULT 'PAGADO',
    "fechaMatricula" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Matricula_cursoId_idx" ON "Matricula"("cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_userId_cursoId_key" ON "Matricula"("userId", "cursoId");

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
