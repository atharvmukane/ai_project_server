import express, { Router } from 'express';
import { addWalletBalance, getWalletBalance, redeemWalletBalance, refundWalletBalance } from './wallet.controller';

export const WalletRouter: Router = express.Router();


//api/wallet/getWalletBalance
WalletRouter.post('/getWalletBalance', getWalletBalance);

//api/wallet/addWalletBalance
WalletRouter.post('/addWalletBalance', addWalletBalance);

//api/wallet/refundWalletBalance
WalletRouter.post('/refundWalletBalance', refundWalletBalance);

//api/wallet/redeemWalletBalance
WalletRouter.post('/redeemWalletBalance', redeemWalletBalance);
