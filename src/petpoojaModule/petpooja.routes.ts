import express, { Router } from 'express';
import { getRewards, rewardReedemSendOtp, rewardReedemVerifyOtp, sendingOrder } from './petpooja.controller';

export const PetPoojaRouter: Router = express.Router();


//api/petpooja/sendingorder
PetPoojaRouter.post('/sendingorder', sendingOrder);

//api/petpooja/getrewards
PetPoojaRouter.post('/getrewards', getRewards);

//api/petpooja/rewardreedemsendotp
PetPoojaRouter.post('/rewardreedemsendotp', rewardReedemSendOtp);

//api/petpooja/rewardreedemverifyotp
PetPoojaRouter.post('/rewardreedemverifyotp', rewardReedemVerifyOtp);
