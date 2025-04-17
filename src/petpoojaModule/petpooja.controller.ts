import { ObjectId } from 'mongodb';
import { NextFunction, Request, Response } from 'express';
import { FlowUser, FlowUserModel } from '../userModule/user.model';
import { OrderModel } from './order.model';
import { TransactionFor, TransactionModel, TransactionStatus, TransactionType } from './../transactionModule/transaction.model';
// import { OfferModel, OfferType } from './../offersModule/offers.model';
import { getWalletBalanceByPhone } from './wallet.controller';
// import { UsedOfferModel } from './../offersModule/used_offer_model';
import { ItemModel } from './../itemModule/item.model';
const axios = require("axios").default;

const requiredAmountFotPoint = 100;

const otpRequired = false;

async function checkAndAwardLoyaltyPoints(userId: any, orderAmount: any) {
    // const user = await FlowUserModel.findById(userId);
    // if (!user) {
    //     return { 'success': false };
    // }

    // user.redeemableTxAmount += orderAmount;
    // await user.save();


    // if (user.redeemableTxAmount > 100) {
    //     const pointsToAward = Math.floor(user.redeemableTxAmount / 100);
    //     user.activeLoyaltyPoints += pointsToAward;
    //     user.accumulatedLoyaltyPoints += pointsToAward;
    //     user.redeemableTxAmount -= (pointsToAward * 100);
    //     user.lastAwardedPointsDate = new Date();

    //     await user.save();
    //     console.log('Points awarded');

    // } else {
    //     console.log('No points awarded');
    // }


    // return { 'success': true };
};

export const sendingOrder = async (req: Request, res: Response) => {
    try {

        let { token, data } = req.body;

        let walletAmount = 0, cashAmount = 0;

        console.log(`data: ` + data);
        console.log(`token: ` + token);

        if (token != null && data != null) {
            const user = await FlowUserModel.findOne({ phone: data['Customer']['phone'], isActive: true, isDeleted: false });
            if (!user) {
                return res.status(200).json({
                    status: false,
                    message: 'User not found',
                });
            }

            const order = await OrderModel.create(data);
            if (!order) {
                return res.status(200).json({
                    status: false,
                    message: 'Failed to record order',
                });
            }

            console.log('order created');

            // check wallet balance applied
            if (data['Order']['payment_type'] == "Part Payment" || data['Order']['payment_type'] == 'Wallet') {
                const walletResponse: any = await getWalletBalanceByPhone(data['Customer']['phone']);
                console.log('wallet fetched');
                if (walletResponse['success'] == '1') {
                    const newWalletWabalance = (+walletResponse['credit']);
                    if (user.walletBalance != +newWalletWabalance) {
                        console.log('Wallet balance different');
                        console.log(`newWalletWabalance: ${newWalletWabalance}`);
                        console.log(`oldWalletWabalance: ${user.walletBalance}`);

                        walletAmount = user.walletBalance - (+newWalletWabalance);
                        cashAmount = data['Order']['total'] - walletAmount;
                        console.log(`order wallet amount: ${walletAmount}`);
                        console.log(`order cash amount: ${cashAmount}`);

                        user.walletBalance = newWalletWabalance;
                        user.save();
                    }
                } else {
                    console.log('wallet fetch success false');
                }

            } else {
                cashAmount = data['Order']['total'];
            }
            // check wallet balance applied //

            // check discount(offer) applied
            if ((data['Discount'].length > 0)) {
                console.log(data['Discount']);
                console.log(data['Discount'][0]['amount']);
                // user.totalSavings += (data['Discount'][0]['amount'] ?? 0);
                await FlowUserModel.findByIdAndUpdate(user._id, { $inc: { totalSavings: data['Discount'][0]['amount'] ?? 0 } });
                console.log(user.totalSavings + (data['Discount'][0]['amount'] ?? 0));
            }
            // check discount(offer) applied //

            const transaction = await TransactionModel.create({
                user: user._id,
                orderId: data['Order']['orderID'],
                transactionStatus: TransactionStatus.SUCCESS,
                transactionType: TransactionType.Debit,
                transactionFor: TransactionFor.Order,
                totalAmount: cashAmount + walletAmount,
                cashAmount: cashAmount,
                walletAmount: walletAmount,
                walletBalance: user.walletBalance,
            });

            await checkAndAwardLoyaltyPoints(user._id, data['Order']['total']);

            console.log('transaction created');

            return res.status(200).json({
                status: true,
                message: 'Transaction Recorded',
            });

        } else {
            return res.status(200).json({
                status: false,
                message: 'Failed to record transaction',
            });
        }

    } catch (error: any) {
        console.log(error.message);
        return res.status(400).json({
            status: false,
            // error: error.message,
            message: 'Failed to record transaction',
        });
    }
};


export const getRewards = async (req: Request, res: Response) => {
    try {

        // let { token, number, eateryBranchCode, bill_amount }: any = req.body;


        // console.log(token);
        // console.log(number);
        // console.log("Called for rewards");

        // const user = await FlowUserModel.findOne({ phone: number, isActive: true, isDeleted: false });

        // if (!user) {
        //     return res.status(200).json({
        //         status: false,
        //         data: "",
        //     });
        // }

        // const offers = await OfferModel.find({
        //     requiredPoints: { $lte: user.activeLoyaltyPoints },
        //     type: OfferType.Normal,
        //     endDate: { $gte: new Date() },
        //     isActive: true,
        //     isDeleted: false,
        // });

        // let offersToSend: any = [];
        // if (offers) {
        //     offers.forEach((o) => {
        //         offersToSend.push({
        //             "id": o._id.toString(),
        //             "name": o.name,
        //             "points": o.discount.toString(),
        //             "discount_type": o.discountType.toString(),
        //             "pos_item_id": o.posItemId ?? '',
        //         });
        //     });

        //     console.log(offersToSend);
        //     return res.status(200).json({
        //         status: true,
        //         otp_required: otpRequired,
        //         reward_information: {
        //             normal_rewards: offersToSend,
        //             name: user.fullName,
        //             phone: user.phone,
        //             balance_points: '0',
        //             reedemable_points: '0',
        //         },
        //     });

        // } else {
        return res.status(200).json({
            status: false,
            data: "",
        });
        // }

    } catch (error: any) {
        return res.status(400).json({
            status: false,
            data: "",
            // error: error.message,
            // message: 'Failed to record transaction',
        });
    }
};


export const rewardReedemSendOtp = async (req: Request, res: Response) => {
    try {

        let { token, number, reward_points, points, Invoice_amount, Invoice_no, eateryBranchCode }: any = req.body;

        let reward_name;
        let reward_type;
        let otpResponse;

        console.log(token + 'Reward Redeem send otp started');
        console.log(number);
        console.log(`offerId: ${reward_points}`);
        console.log(`loyalty offered: ${points}`);

        if (reward_points == null || reward_points == 0) {
            return res.status(200).json({
                status: false,
                message: 'Invalid offer data',
            });
        }

        console.log('offer');
        // const offerToRedeem = await OfferModel.findById(reward_points);

        // if (!offerToRedeem) {
        //     console.log('Offer not found');
        //     return res.status(200).json({
        //         status: false,
        //         message: 'Offer not found',
        //     });
        // }

        // reward_name = offerToRedeem.name;
        // reward_type = offerToRedeem.discountType;
        // if (!otpRequired) {
        // offerToRedeem.isUsed = true;
        // await offerToRedeem.save();
        // }

        if (otpRequired) {
            const otpUrl = `https://api.msg91.com/api/v5/otp?template_id=${process.env.MSG91TEMPLATEID}&mobile=+91${number}&authkey=${process.env.MSG91AUTHKEY}&otp_length=6`;
            otpResponse = await axios.get(otpUrl);
            console.log(otpResponse);

        } else {
            const user = await FlowUserModel.findOne({ phone: number, isActive: true, isDeleted: false });
            if (!user) {
                return res.status(200).json({
                    status: false,
                    message: 'User not found',
                });
            }

            // user.activeLoyaltyPoints -= offerToRedeem.requiredPoints;
            await user.save();

            // let usedOfferData: any = {
            //     pointsUsed: offerToRedeem.requiredPoints,
            //     offer: offerToRedeem._id,
            //     user: user._id,
            // };

            // if (offerToRedeem.discountType == '3') {
            //     console.log(offerToRedeem.discountType);
            //     const item = await ItemModel.findOne({ petPoojaItemId: offerToRedeem.posItemId });
            //     if (item) {
            //         usedOfferData.item = item._id;
            //     }
            // }
            // console.log(usedOfferData);
            // await UsedOfferModel.create(usedOfferData);

        }

        if (token != null && (!otpRequired || (otpRequired && otpResponse['data']['type'] == 'success'))) {
            console.log("Ended");

            return res.status(200).json({
                status: true,
                message: 'success',
                reward_name: reward_name,
                reward_type: reward_type,
            });

        } else if (token != null && otpRequired && otpResponse['data']['type'] != 'success') {
            return res.status(200).json({
                status: false,
                message: 'Failed to send otp',
            });

        } else {
            return res.status(200).json({
                status: false,
                message: 'This user doesn\'t have sufficient balance.',
            });
        }

    } catch (error: any) {
        console.log(error);
        return res.status(400).json({
            status: false,
            // error: error.message,
            message: 'This user doesn\'t have sufficient balance.',
        });
    }
};


export const rewardReedemVerifyOtp = async (req: Request, res: Response) => {
    try {

        let { token, number, reward_points, points, Invoice_amount, Invoice_no, eateryBranchCode, otp }: any = req.body;

        let reward_name;
        let reward_type;
        let offerToRedeem;

        console.log(token);
        console.log("Called for redeem verify otp");

        const otpUrl = `https://api.msg91.com/api/v5/otp/verify?authkey=${process.env.MSG91AUTHKEY}&mobile=+91${number}&otp=${otp}`;

        if (reward_points != 0) {
            return res.status(200).json({
                status: false,
                message: 'Invalid offer',
            });
        }

        // offerToRedeem = await OfferModel.findById(reward_points);
        // if (offerToRedeem) {
        //     reward_name = offerToRedeem.name;
        //     reward_type = offerToRedeem.discountType;
        // }

        const verifyOtpResponse = await axios.get(otpUrl);
        console.log(verifyOtpResponse);

        if (token != null && verifyOtpResponse['data']['type'] == 'success') {

            if (offerToRedeem) {
                //     offerToRedeem.isUsed = true;
                //     await offerToRedeem.save();
                const user = await FlowUserModel.findOne({ phone: number, isActive: true, isDeleted: false });
                if (!user) {
                    return res.status(200).json({
                        status: false,
                        message: 'User not found',
                    });
                }

                // user.activeLoyaltyPoints -= offerToRedeem.requiredPoints;
                user.save();

                // let usedOfferData: any = {
                //     pointsUsed: offerToRedeem.requiredPoints,
                //     offer: offerToRedeem._id,
                //     user: user._id,
                // };

                // if (offerToRedeem.discountType == '3') {
                //     const item = await ItemModel.findOne({ petPoojaItemId: offerToRedeem.posItemId });
                //     if (item) {
                //         usedOfferData.item = item._id;
                //     }
                // }

                // await UsedOfferModel.create(usedOfferData);
            }

            return res.status(200).json({
                status: true,
                message: 'success',
                reward_name: reward_name,
                reward_type: reward_type,
            });

        } else if (token != null && verifyOtpResponse['data']['type'] != 'success') {
            return res.status(200).json({
                status: false,
                message: 'Incorrect Otp',
            });

        } else {
            return res.status(200).json({
                status: false,
                message: 'Failed to verify otp',
            });
        }

    } catch (error: any) {
        return res.status(400).json({
            status: true,
            // error: error.message,
            message: 'Failed to verify otp',
        });
    }
};
