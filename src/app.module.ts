import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoansService } from './loans/loans.service';
import { LoansController } from './loans/loans.controller';
import { PrismaService } from './prisma.service';

@Module({
    imports: [],
    controllers: [AppController, LoansController],
    providers: [AppService, LoansService, PrismaService],
})
export class AppModule {}
