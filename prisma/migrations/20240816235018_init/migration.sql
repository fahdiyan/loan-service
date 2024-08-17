-- CreateEnum
CREATE TYPE "LoanState" AS ENUM ('PROPOSED', 'APPROVED', 'INVESTED', 'DISBURSED');

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "borrowerId" INTEGER NOT NULL,
    "principalAmount" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "roi" DOUBLE PRECISION NOT NULL,
    "agreementLink" TEXT NOT NULL,
    "state" "LoanState" NOT NULL DEFAULT 'PROPOSED',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,
    "approvalProof" TEXT,
    "investedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "disbursedAt" TIMESTAMP(3),
    "disbursedBy" INTEGER,
    "disbursementProof" TEXT,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investor" (
    "id" SERIAL NOT NULL,
    "loanId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "investorId" INTEGER NOT NULL,

    CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Investor" ADD CONSTRAINT "Investor_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
