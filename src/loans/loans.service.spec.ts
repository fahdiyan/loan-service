import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { PrismaService } from '../prisma.service';
import { LoanState } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('LoansService', () => {
    let service: LoansService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LoansService, PrismaService],
        }).compile();

        service = module.get<LoansService>(LoansService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('createLoan', () => {
        it('should create a loan with the proposed state', async () => {
            const loanData = {
                borrowerId: 123456,
                principalAmount: 1000,
                rate: 5,
                roi: 10,
                agreementLink: 'http://agreement.link',
            };

            prisma.loan.create = jest.fn().mockResolvedValue({
                ...loanData,
                id: 1,
                state: LoanState.PROPOSED,
            });

            const result = await service.createLoan(loanData);

            expect(result.state).toBe(LoanState.PROPOSED);
            expect(prisma.loan.create).toHaveBeenCalledWith({
                data: { ...loanData, state: LoanState.PROPOSED },
            });
        });
    });

    describe('approveLoan', () => {
        it('should approve a loan and move it to the approved state', async () => {
            const loan = {
                id: 1,
                state: LoanState.PROPOSED,
            };

            prisma.loan.findUnique = jest.fn().mockResolvedValue(loan);
            prisma.loan.update = jest.fn().mockResolvedValue({
                ...loan,
                state: LoanState.APPROVED,
                approvalProof: 'http://proof.image',
                approvedBy: 123,
                approvedAt: new Date('2024-08-17'),
            });

            const result = await service.approveLoan(1, {
                approvalProof: 'http://proof.image',
                approvedBy: 123,
                approvedDate: '2024-08-17',
            });

            expect(result.state).toBe(LoanState.APPROVED);
            expect(prisma.loan.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    state: LoanState.APPROVED,
                    approvalProof: 'http://proof.image',
                    approvedBy: 123,
                    approvedAt: expect.any(Date),
                },
            });
        });

        it('should throw an error if loan is not in proposed state', async () => {
            prisma.loan.findUnique = jest.fn().mockResolvedValue({
                id: 1,
                state: LoanState.APPROVED,
            });

            await expect(
                service.approveLoan(1, {
                    approvalProof: 'http://proof.image',
                    approvedBy: 123,
                    approvedDate: '2024-08-17',
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('investInLoan', () => {
        it('should invest in a loan and move it to invested state if fully funded', async () => {
            let loan = {
                id: 1,
                state: LoanState.APPROVED,
                principalAmount: 1000,
                investedAmount: 500,
            };

            prisma.loan.findUnique = jest.fn().mockResolvedValueOnce(loan);
            prisma.loan.update = jest.fn().mockResolvedValueOnce({
                ...loan,
                state: LoanState.APPROVED,
                investedAmount: 800,
            });
            prisma.investor.create = jest.fn().mockResolvedValue({});

            let result = await service.investInLoan(1, 2, 300);

            expect(result.state).toBe(LoanState.APPROVED);
            expect(prisma.loan.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    investedAmount: 800,
                    state: LoanState.APPROVED,
                },
            });
            expect(prisma.investor.create).toHaveBeenCalledWith({
                data: { loanId: 1, investorId: 2, amount: 300 },
            });

            prisma.loan.update = jest.fn().mockResolvedValue({
                ...loan,
                state: LoanState.INVESTED,
                investedAmount: 1000,
            });
            loan.investedAmount = 800;
            prisma.loan.findUnique = jest.fn().mockResolvedValueOnce(loan);
            result = await service.investInLoan(1, 3, 200);

            expect(result.state).toBe(LoanState.INVESTED);
            expect(prisma.loan.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    investedAmount: 1000,
                    state: LoanState.INVESTED,
                },
            });
            expect(prisma.investor.create).toHaveBeenCalledWith({
                data: { loanId: 1, investorId: 3, amount: 200 },
            });
        });

        it('should throw an error if loan is not in approved state', async () => {
            prisma.loan.findUnique = jest.fn().mockResolvedValue({
                id: 1,
                state: LoanState.PROPOSED,
            });

            await expect(service.investInLoan(1, 1, 500)).rejects.toThrow(BadRequestException);
        });

        it('should throw an error if invested amount exceeds principal', async () => {
            const loan = {
                id: 1,
                state: LoanState.APPROVED,
                principalAmount: 1000,
                investedAmount: 900,
            };

            prisma.loan.findUnique = jest.fn().mockResolvedValue(loan);

            await expect(service.investInLoan(1, 1, 200)).rejects.toThrow(BadRequestException);
        });
    });

    describe('disburseLoan', () => {
        it('should disburse a loan and move it to disbursed state', async () => {
            const loan = {
                id: 1,
                state: LoanState.INVESTED,
            };

            prisma.loan.findUnique = jest.fn().mockResolvedValue(loan);
            prisma.loan.update = jest.fn().mockResolvedValue({
                ...loan,
                state: LoanState.DISBURSED,
                disbursementProof: 'http://proof.image',
                disbursedBy: 123,
                disbursedAt: new Date(),
            });

            const result = await service.disburseLoan(1, {
                disbursementProof: 'http://proof.image',
                disbursedBy: 123,
            });

            expect(result.state).toBe(LoanState.DISBURSED);
            expect(prisma.loan.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    state: LoanState.DISBURSED,
                    disbursementProof: 'http://proof.image',
                    disbursedBy: 123,
                    disbursedAt: expect.any(Date),
                },
            });
        });

        it('should throw an error if loan is not in invested state', async () => {
            prisma.loan.findUnique = jest.fn().mockResolvedValue({
                id: 1,
                state: LoanState.APPROVED,
            });

            await expect(
                service.disburseLoan(1, {
                    disbursementProof: 'http://proof.image',
                    disbursedBy: 123,
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });
});
