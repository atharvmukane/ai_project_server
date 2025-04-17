import { ObjectId } from 'mongodb';
import { NextFunction, Request, Response } from 'express';
import { User, UserModel } from '../userModule/user.model';
const axios = require("axios").default;

const restId = '9ps2tefa'; // Mahalaxmi
// const restId = '5cn74ore'; // Urmi
const APIKEY = '27gruo9iedty6q8cn510fxmzh34kasbv';
const APISECRETKEY = '9dbb53c3f14cd6ce5d628e8c2571e91e18599fac';
const ACCESSTOKEN = '9dac9cf276b426987b762ed8c5b824e18f1fb9bd';
const getWalletBalanceUrl = 'http://api.petpooja.com/V1/thirdparty/get_virtual_wallet_points/';
const addWalletBalanceUrl = 'http://api.petpooja.com/V1/thirdparty/add_virtual_wallet_points/';
const refundWalletBalanceUrl = 'http://api.petpooja.com/V1/thirdparty/refund_virtual_wallet_points/';
const redeemWalletBalanceUrl = 'http://api.petpooja.com/V1/thirdparty/redeem_virtual_wallet_points/';


export async function getWalletBalanceByPhone(phone: any) {

    console.log(`phone: ${phone}`);

    const headers = {
        "Content-Type": 'application/json',
    };
    const body = {
        "app_key": APIKEY,
        "app_secret": APISECRETKEY,
        "access_token": ACCESSTOKEN,
        "restID": restId,
        "customer_phone": phone,
    };


    let putItem = new Promise(async (resolve, reject) => {
        try {
            axios
                .post(getWalletBalanceUrl, body, { headers: headers })
                .then(function (response: any) {
                    resolve(response.data);
                })
                .catch(function (error: any) {
                    resolve(null);
                });
        } catch (error) {
            resolve(null);
        }
    });



    return await putItem;

    // if (!result['status']) {
    //     return false;
    // }

    // const user = await UserModel.findOneAndUpdate(
    //     { phone: phone, isActive: true, isDeleted: false },
    //     { walletBalance: +result['result']['credit'] }
    // );

    // if (!user) {
    //     return false;
    // }

    // return true;
}


export const getWalletBalance = async (req: Request, res: Response) => {
    try {

        let { phone } = req.body;


        const headers = {
            "Content-Type": 'application/json',
        };
        const body = {
            "app_key": APIKEY,
            "app_secret": APISECRETKEY,
            "access_token": ACCESSTOKEN,
            "restID": restId,
            "customer_phone": phone,
        };


        let putItem = new Promise(async (resolve, reject) => {
            try {
                axios
                    .post(getWalletBalanceUrl, body, { headers: headers })
                    .then(function (response: any) {
                        resolve(response.data);
                    })
                    .catch(function (error: any) {
                        resolve(null);
                    });
            } catch (error) {
                resolve(null);
            }
        });



        const result: any = await putItem;

        return res.status(200).json({
            status: result != null,
            message: result != null ? 'Balance fetched success' : 'Failed to get balance',
            result: result,
        });

    } catch (error: any) {
        return res.status(400).json({
            status: false,
            // error: error.message,
            message: 'Failed to get balance',
        });
    }
};


export const addWalletBalance = async (req: Request, res: Response) => {
    try {

        let { phone, cardNo, amount } = req.body;


        const headers = {
            "Content-Type": 'application/json',
        };
        const body = {
            "app_key": APIKEY,
            "app_secret": APISECRETKEY,
            "access_token": ACCESSTOKEN,
            "restID": restId,
            "customer_phone": phone,
            "credit": amount,
            "send_sms": "0",
            // "amount": "1000",
            // "expiry": "2024-12-31",
            // "card_no": cardNo,
        };

        let putItem = new Promise(async (resolve, reject) => {
            try {
                axios
                    .post(addWalletBalanceUrl, body, { headers: headers })
                    .then(function (response: any) {
                        resolve(response.data);
                    })
                    .catch(function (error: any) {
                        resolve(null);
                    });
            } catch (error) {
                resolve(null);
            }
        });

        const result: any = await putItem;

        return res.status(200).json({
            status: result != null,
            message: result != null ? 'Balance added success' : 'Failed to add balance',
            result: result,
        });

    } catch (error: any) {
        return res.status(400).json({
            status: false,
            // error: error.message,
            message: 'Failed to add balance',
        });
    }
};

export const refundWalletBalance = async (req: Request, res: Response) => {
    try {

        let { phone, amount, orderId } = req.body;


        const headers = {
            "Content-Type": 'application/json',
        };
        const body = {
            "app_key": APIKEY,
            "app_secret": APISECRETKEY,
            "access_token": ACCESSTOKEN,
            "restID": restId,
            "customer_phone": phone,
            "credit": amount,
            "order_id": orderId
        };

        let putItem = new Promise(async (resolve, reject) => {
            try {
                axios
                    .post(refundWalletBalanceUrl, body, { headers: headers })
                    .then(function (response: any) {
                        resolve(response.data);
                    })
                    .catch(function (error: any) {
                        resolve(null);
                    });
            } catch (error) {
                resolve(null);
            }
        });

        const result: any = await putItem;

        return res.status(200).json({
            status: result != null,
            message: result != null ? 'Balance refund success' : 'Failed to refund balance',
            result: result,
        });

    } catch (error: any) {
        return res.status(400).json({
            status: false,
            // error: error.message,
            message: 'Failed to add balance',
        });
    }
};


export const redeemWalletBalance = async (req: Request, res: Response) => {
    try {

        let { phone, amount, orderId } = req.body;

        const headers = {
            "Content-Type": 'application/json',
        };
        const body =
        {
            "app_key": APIKEY,
            "app_secret": APISECRETKEY,
            "access_token": ACCESSTOKEN,
            "restID": restId,
            "customer_phone": phone,
            "credit": amount,
            "order_id": orderId,
            "send_sms": "0"
        };


        let putItem = new Promise(async (resolve, reject) => {
            try {
                axios
                    .post(redeemWalletBalanceUrl, body, { headers: headers })
                    .then(function (response: any) {
                        resolve(response.data);
                    })
                    .catch(function (error: any) {
                        resolve(null);
                    });
            } catch (error) {
                resolve(null);
            }
        });


        const result: any = await putItem;

        return res.status(200).json({
            status: result != null,
            message: result != null ? 'Balance redeem success' : 'Failed to redeem balance',
            result,
        });

    } catch (error: any) {
        return res.status(400).json({
            status: false,
            // error: error.message,
            message: 'Failed to redeem balance',
        });
    }
};
