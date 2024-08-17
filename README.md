## Description
This is a simple loan engine that describe loan process from propose until disburse

## Installation

```bash
$ npm install
$ prisma db push
$ prisma generate
```

## Running the app

```bash
# first init
$ npm run start:dev
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## API Documentation

POST {base-url}/loans
```bash
/**
 * Creates a new loan using the provided data.
 *
 * @body 
 *   borrowerId: A non-empty integer representing the ID of the borrower.
 *   principalAmount: A non-empty number representing the principal amount of the loan.
 *   rate: A non-empty number representing the interest rate of the loan.
 *   roi: A non-empty number representing the return on investment.
 *   agreementLink: A non-empty URL string pointing to the loan agreement document.
 * @returns The newly created loan object.
 */
 
// sample payload request body
{
  "borrowerId": 123,
  "principalAmount": 5000,
  "rate": 5,
  "roi": 3,
  "agreementLink": "http://example.com/loan-agreement"
}
```
POST {base-url}/loans/:loanId/approve
```bash
/**
 * Approves a loan by updating its state to 'APPROVED' along with approval details.
 *
 * @param loanId - The ID of the loan to be approved.
 * @body 
 *  approvalProof: A non-empty string representing the proof of approval.
 *  approvedBy: A non-empty integer representing the ID of the approver.
 *  approvedDate: A non-empty date string representing the date of approval.
 * @returns The updated loan object with the 'APPROVED' state and approval details.
 */
 
// sample payload request body
{
  "approvedBy": 1,
  "approvedDate": "2024-08-17",
  "approvalProof": "link-to-document.jpg"
}
```
POST {base-url}/loans/:loanId/invest
```bash
/**
 * Invests a specified amount in a loan if it is in the 'APPROVED' state.
 * Throws an error if the invested amount exceeds the principal amount of the loan.
 * Updates the loan invested amount and state accordingly.
 * Triggers an email to all investors if the loan becomes fully invested.
 *
 * @param loanId - The ID of the loan to invest in.
 * @body
 *  investorId: A number representing the ID of the investor. It must be an integer and cannot be empty.
 *  amount: A number representing the amount to be invested. It must be a number and cannot be empty.
 * @returns The updated loan object after the investment.
 */
 
// sample payload request body
{
  "investorId": 1,
  "amount": 10000000,
}
```
POST {base-url}/loans/:loanId/disburse
```bash
/**
 * Disburses a loan by updating its state to 'DISBURSED' with the provided disbursement proof, disbursed by, and disbursed date.
 *
 * @param loanId - The ID of the loan to be disbursed.
 * @body 
 *   disbursementProof: A string that must not be empty.
 *   disbursedBy: A number that must not be empty and must be an integer.
 * @returns The updated loan object with the 'DISBURSED' state and disbursement details.
 */
 
//sample payload request body
{
  "disbursedBy": 1,
  "disbursementProof": "link-to-document.jpg"
}
```