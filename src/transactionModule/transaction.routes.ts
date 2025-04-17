import express, { Router } from 'express';
import { fetchTransactions, rechargeWallet, updateTransactionStatus, } from './transaction.controller';
import { verifyJwtToken } from './../utils/middleware/verify-jwt-token';

export const TransactionRoutes: Router = express.Router();


//api/transaction/fetchTransactions
TransactionRoutes.get('/fetchTransactions', verifyJwtToken, fetchTransactions);

//api/transaction/walletRecharge
TransactionRoutes.post('/walletRecharge', verifyJwtToken, rechargeWallet);

//api/transaction/updateTransactionStatus
TransactionRoutes.post('/updateTransactionStatus', updateTransactionStatus);
