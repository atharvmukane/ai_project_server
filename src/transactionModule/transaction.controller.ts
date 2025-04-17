import { ObjectId } from 'mongodb';
import { NextFunction, Request, Response } from 'express';
import { BalanceAddStatus, TransactionFor, TransactionModel, TransactionStatus, TransactionType } from './transaction.model';
import { rzp_instance } from './../config';
import Razorpay from "razorpay";
import { FlowUser, FlowUserModel } from './../userModule/user.model';
import { uploadToS3Bucket } from '../../src/utils/generic/fileUpload';
const axios = require("axios").default;


const restId = '9ps2tefa'; // Mahalaxmi
// const restId = '5cn74ore'; // Urmi
const APIKEY = '27gruo9iedty6q8cn510fxmzh34kasbv';
const APISECRETKEY = '9dbb53c3f14cd6ce5d628e8c2571e91e18599fac';
const ACCESSTOKEN = '9dac9cf276b426987b762ed8c5b824e18f1fb9bd';
const getWalletBalanceUrl = 'http://api.petpooja.com/V1/thirdparty/get_virtual_wallet_points/';
const addWalletBalanceUrl = 'http://api.petpooja.com/V1/thirdparty/add_virtual_wallet_points/';

export const fetchTransactions = async (req: Request, res: Response) => {
    try {

        const { user } = req.body
        const transaction = await TransactionModel.find({ transactionStatus: TransactionStatus.SUCCESS, user: user })
            .sort({ createdAt: -1 });


        if (transaction) {
            const userData = await FlowUserModel.findById(user, { walletBalance: 1 });
            return res.status(200).json({
                success: true,
                result: transaction,
                walletBalance: userData != null ? userData!.walletBalance : null,
                message: 'transactionFetched',
            });

        } else {
            return res.status(200).json({
                success: false,
                message: 'failedGettransaction',
            });
        }
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message,
            message: 'failedGettransaction',
        });
    }
};

export const rechargeWallet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        let { user, rechargeAmount, total } = req.body;

        var options = {
            amount: Math.round(total * 100),
            currency: "INR",
            receipt: `Iteeha`,
        };

        let result = await rzp_instance.orders.create(options);

        const transaction = await TransactionModel.create({
            user: user,
            rzpOrderId: result.id,
            transactionStatus: TransactionStatus.PENDING,
            transactionType: TransactionType.Credit,
            transactionFor: TransactionFor.WalletRecharge,
            // transactionMedium: transactionData.transactionMedium,
            rechargeAmount: rechargeAmount,
            totalAmount: total,
            cashAmount: total,
            walletAmount: 0,
            balanceAddStatus: BalanceAddStatus.PENDING,
        });

        return res.status(200).json({
            message: transaction != null ? "" : "purchaseFailed",
            success: transaction != null,
            result: transaction,
        });

    } catch (e) {
        return res.status(200).json({
            message: "purchaseFailed",
            success: false,
        });
    }
};


async function addPetPoojaWalletBalance(phone: any, amount: any) {

    const headers = {
        "Content-Type": 'application/json',
    };
    const body = {
        "app_key": APIKEY,
        "app_secret": APISECRETKEY,
        "access_token": ACCESSTOKEN,
        "restID": restId,
        "customer_phone": phone,
        "credit": amount.toString(),
        "send_sms": "0",
    };

    let putItem = new Promise(async (resolve, reject) => {
        try {
            axios
                .post(addWalletBalanceUrl, body, { headers: headers })
                .then(function (response: any) {
                    resolve(response.data);
                    console.log(`add wallet balance data response: ${response.data.toString()}`);
                })
                .catch(function (error: any) {
                    resolve(null);
                    console.log('failed null');
                });
        } catch (error) {
            resolve(null);
        }
    });

    let result: any = await putItem;

    if (result == null || result["success"] != "1") {
        // console.log(`Petpooja add balance result: ${result}`);
        // result = await addPetPoojaWalletBalance(phone, amount);
    }

    return result;
}

export const updateTransactionStatus = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        console.log("updateTransactionStatus START");
        const secret: any = process.env.RAZOR_PAY_WEBHOOKS_SECRET;
        const reqBody = JSON.stringify(req.body);
        const signature = req.headers["x-razorpay-signature"];
        console.log("payment started");
        console.log(JSON.stringify(req.body, null, 2));
        console.log(signature);
        console.log(Razorpay.validateWebhookSignature(reqBody, signature, secret));

        // CHECK FOR VALID REQUEST
        if (!Razorpay.validateWebhookSignature(reqBody, signature, secret)) {
            return res.status(200).json("Not a valid razorpay request");
        }

        if (
            req.body.event.includes("payment") ||
            req.body.event.includes("order")
        ) {
            const entity = req.body.payload.payment.entity;

            if (entity == undefined || entity == null) {
                return res.status(200).json("Invalid Response. NO Entity received");
            }

            //CHECK DUPLICATE REQUEST
            const transactionResponse: any = await TransactionModel.findOne({
                rzpPaymentId: entity.id,
            });

            if (transactionResponse) {
                console.log("duplicate request");
                return res.status(200).json("duplicate request");
            }

            // CHECK PAYMENT AUTHORIZED
            if (entity.status != "authorized") {
                console.log("error response");
                return res.status(200).json("Bad request");
            }

            // // SAVE Transaction DATA
            const transaction = await TransactionModel.findOne({
                rzpOrderId: entity.order_id,
            });


            if (!transaction) {
                console.log("transaction not found");
                return res.status(200).json("transaction not found");
            }

            console.log(`Transaction found`);

            let balanceAddStatus: any;
            if (transaction.transactionFor == TransactionFor.WalletRecharge) {

                // let user = await FlowUserModel.findById(transaction.user);

                console.log(`Calling petpooja add balance`);
                // const petpoojaTransaction = await addPetPoojaWalletBalance(user?.phone, transaction.rechargeAmount);
                // if (petpoojaTransaction == null || petpoojaTransaction["success"] != "1") {
                //     balanceAddStatus = BalanceAddStatus.FAILED;
                // } else if (petpoojaTransaction["success"] == "1") {
                //     balanceAddStatus = BalanceAddStatus.SUCCESS;
                // }

                // console.log(`called petpooja add wallet: ${petpoojaTransaction.toString()}`);

                // const previousTransaction = await TransactionModel.findOne({
                //     user: transaction.user,
                //     transactionStatus: TransactionStatus.SUCCESS,
                //     transactionFor: TransactionFor.WalletRecharge,
                // }, { walletBalance: 1 }).sort({ paidSuccesOn: -1 });

                // console.log(previousTransaction);

                // transaction.walletBalance = ((previousTransaction != null ? previousTransaction.walletBalance : 0) + transaction.rechargeAmount);
                // user = await FlowUserModel.findByIdAndUpdate(
                //     transaction.user,
                //     { walletBalance: transaction.walletBalance },
                //     { new: true }
                // );
            }

            transaction.rzpPaymentId = entity.id;
            transaction.transactionStatus = TransactionStatus.SUCCESS;
            transaction.paidSuccesOn = new Date();
            transaction.balanceAddStatus = balanceAddStatus;
            transaction.save();

            console.log("transaction: " + transaction);
        }
        //    else if (req.body.event.includes("refund")) {
        //     console.log("REFUND WEBHOOK");

        //     const rzp_refund_id = req.body.payload.refund.entity.id;
        //     const rzp_order_id = req.body.payload.payment.entity.order_id;

        //     if (req.body.event == "refund.created") {
        //       console.log("REFUND CREATED");

        //       const workOrder = await WorkOrderModel.findOneAndUpdate(
        //         { rzpOrderId: { $in: [rzp_order_id] } },
        //         { transactionStatus: WTS.REFUNDPROCESSING }
        //       );
        //     } else if (req.body.event == "refund.processed") {
        //       console.log("REFUND PROCESSED");

        //       const workOrder: any = await WorkOrderModel.findOneAndUpdate(
        //         { rzpOrderId: { $in: rzp_order_id } },
        //         {
        //           transactionStatus: WTS.REFUNDCOMPLETED,
        //           refundedOn: new Date(),
        //         }
        //       );

        //       if (workOrder) {
        //         const refundTransaction = await initializeTransaction({
        //           customer: workOrder.customer,
        //           workOrder: workOrder._id,
        //           service: workOrder.service,
        //           transactionStatus: TransactionStatus.SUCCESS,
        //           transactionType: TransactionType.CREDIT,
        //           transactionMedium:
        //             workOrder.refundData["refundWallet"] > 0
        //               ? TransactionMedium.HYBRID
        //               : TransactionMedium.CASH,
        //           transactionFor: TransactionFor.REFUND,
        //           cashAmount: workOrder.refundData["refundCash"],
        //           walletAmount: workOrder.refundData["refundWallet"],
        //           totalAmount:
        //             workOrder.refundData["refundCash"] +
        //             workOrder.refundData["refundWallet"],

        //           rzpRefundId: rzp_refund_id,
        //           paidSuccesOn: new Date(),
        //         });

        //         if (refundTransaction && workOrder.refundData["refundWallet"] > 0) {
        //           await CustomerModel.findByIdAndUpdate(workOrder.customer, {
        //             $inc: { walletBalance: workOrder.refundData["refundWallet"] },
        //           });
        //         }
        //       }
        //     }
        //   }

        console.log("updateTransactionStatus END");

        return res.status(200).json("payment saved");
    } catch (error) {
        return res.status(200).json("payment saved");
    }
};


