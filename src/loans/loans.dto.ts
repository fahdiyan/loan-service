import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsUrl } from 'class-validator';

export class CreateLoanDto {
    @IsNotEmpty()
    @IsInt()
    borrowerId: number;
    @IsNotEmpty()
    @IsNumber()
    principalAmount: number;
    @IsNotEmpty()
    @IsNumber()
    rate: number;
    @IsNotEmpty()
    @IsNumber()
    roi: number;
    @IsNotEmpty()
    @IsUrl()
    agreementLink: string;
}

export class ApproveLoanDto {
    @IsNotEmpty()
    approvalProof: string;
    @IsNotEmpty()
    @IsInt()
    approvedBy: number;
    @IsNotEmpty()
    @IsDateString()
    approvedDate: string;
}

export class InvestLoanDto {
    @IsNotEmpty()
    @IsInt()
    investorId: number;
    @IsNotEmpty()
    @IsNumber()
    amount: number;
}
export class DisburseLoanDto {
    @IsNotEmpty()
    disbursementProof: string;
    @IsNotEmpty()
    @IsInt()
    disbursedBy: number;
}
