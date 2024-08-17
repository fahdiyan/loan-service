import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LoanState } from '@prisma/client';
import { ApproveLoanDto, CreateLoanDto, DisburseLoanDto } from './loans.dto';

@Injectable()
export class LoansService {
    constructor(private prisma: PrismaService) {}

    /**
     * Creates a new loan with the provided borrower ID, principal amount, rate, ROI, and agreement link.
     *
     * @param data - An object containing borrower ID, principal amount, rate, ROI, and agreement link.
     * @returns The newly created loan object with the state set to 'PROPOSED'.
     */
    async createLoan(data: CreateLoanDto) {
        return this.prisma.loan.create({
            data: {
                ...data,
                state: LoanState.PROPOSED,
            },
        });
    }

    /**
     * Approves a loan by updating its state to 'APPROVED' along with approval details.
     *
     * @param loanId - The ID of the loan to be approved.
     * @param approvalData - The approval details including proof, approver ID, and approval date.
     * @returns The updated loan object with the 'APPROVED' state and approval details.
     */
    async approveLoan(loanId: number, approvalData: ApproveLoanDto) {
        const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });

        if (loan.state !== LoanState.PROPOSED) {
            throw new BadRequestException('Loan can only be approved from the proposed state.');
        }

        return this.prisma.loan.update({
            where: { id: loanId },
            data: {
                state: LoanState.APPROVED,
                approvalProof: approvalData.approvalProof,
                approvedBy: approvalData.approvedBy,
                approvedAt: new Date(approvalData.approvedDate),
            },
        });
    }

    /**
     * Invests a specified amount in a loan if it is in the 'APPROVED' state.
     * Throws an error if the invested amount exceeds the principal amount of the loan.
     * Updates the loan's invested amount and state accordingly.
     * Triggers an email to all investors if the loan becomes fully invested.
     *
     * @param loanId - The ID of the loan to invest in.
     * @param investorId - The ID of the investor making the investment.
     * @param amount - The amount to invest in the loan.
     * @returns The updated loan object after the investment.
     */
    async investInLoan(loanId: number, investorId: number, amount: number) {
        const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });

        if (loan.state !== LoanState.APPROVED) {
            throw new BadRequestException('Loan can only be invested in from the approved state.');
        }

        const totalInvested = loan.investedAmount + amount;

        if (totalInvested > loan.principalAmount) {
            throw new BadRequestException('Invested amount exceeds loan principal.');
        }

        const updatedLoan = await this.prisma.loan.update({
            where: { id: loanId },
            data: {
                investedAmount: totalInvested,
                state: totalInvested === loan.principalAmount ? LoanState.INVESTED : loan.state,
            },
        });

        await this.prisma.investor.create({
            data: {
                loanId,
                investorId,
                amount,
            },
        });

        if (updatedLoan.state === LoanState.INVESTED) {
            // Trigger email to all investors with the agreement link
            this.sendAgreementEmail(updatedLoan.id);
        }

        return updatedLoan;
    }

    /**
     * Disburses a loan by updating its state to 'DISBURSED' with the provided disbursement proof, disbursed by, and disbursed date.
     *
     * @param loanId - The ID of the loan to be disbursed.
     * @param disbursementData - The disbursement details including proof, disbursed by, and disbursed date.
     * @returns The updated loan object with the 'DISBURSED' state and disbursement details.
     */
    async disburseLoan(loanId: number, disbursementData: DisburseLoanDto) {
        const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });

        if (loan.state !== LoanState.INVESTED) {
            throw new BadRequestException('Loan can only be disbursed from the invested state.');
        }

        // Process disburse to borrower and then update loan data once disburse has been completed

        return this.prisma.loan.update({
            where: { id: loanId },
            data: {
                state: LoanState.DISBURSED,
                disbursementProof: disbursementData.disbursementProof,
                disbursedBy: disbursementData.disbursedBy,
                disbursedAt: new Date(),
            },
        });
    }

    /**
     * Sends an email to all investors with the agreement link for a specific loan.
     *
     * @param loanId The ID of the loan for which the agreement email is being sent.
     * @returns A promise that resolves once the email is successfully sent.
     */
    private async sendAgreementEmail(loanId: number) {
        // Implementation to send email to all investors with the agreement link
    }
}
