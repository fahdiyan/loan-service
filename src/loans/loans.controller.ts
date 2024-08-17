import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { LoansService } from './loans.service';
import { ApproveLoanDto, CreateLoanDto, DisburseLoanDto, InvestLoanDto } from './loans.dto';

@Controller('loans')
export class LoansController {
    constructor(private readonly loansService: LoansService) {}

    @Post()
    createLoan(@Body() body: CreateLoanDto) {
        return this.loansService.createLoan(body);
    }

    @Post(':loanId/approve')
    approveLoan(@Param('loanId', ParseIntPipe) loanId: number, @Body() body: ApproveLoanDto) {
        return this.loansService.approveLoan(loanId, body);
    }

    @Post(':loanId/invest')
    investInLoan(@Param('loanId', ParseIntPipe) loanId: number, @Body() body: InvestLoanDto) {
        return this.loansService.investInLoan(loanId, body.investorId, body.amount);
    }

    @Post(':loanId/disburse')
    disburseLoan(@Param('loanId', ParseIntPipe) loanId: number, @Body() body: DisburseLoanDto) {
        return this.loansService.disburseLoan(loanId, body);
    }
}
