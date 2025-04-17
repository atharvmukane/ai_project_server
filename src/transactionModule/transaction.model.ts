import { Ref, getModelForClass, prop, } from '@typegoose/typegoose';
// import { Cafeteria } from './../cafeModule/cafe.model';
// import { User, UserRole } from './../userModule/user.model';
// import { Offer } from './../offersModule/offers.model';
import { ObjectId } from 'mongoose';
import { Order } from './../petpoojaModule/order.model';

export enum TransactionType {
    Debit = 'Debit',
    Credit = 'Credit',
}

export enum TransactionFor {
    WalletRecharge = 'WalletRecharge',
    Order = 'Order',
}

export enum TransactionStatus {
    SUCCESS = "Success",
    PENDING = "Pending",
    FAILED = "Failed",
    REFUNDED = "Refunded",
}

export enum BalanceAddStatus {
    SUCCESS = "Success",
    PENDING = "Pending",
    FAILED = "Failed",
    REFUNDED = "Refunded",
}

export class Transaction {
    readonly _id: ObjectId;

    readonly createdAt: Date;

    // @prop({ ref: () => User })
    // user: Ref<User>;

    // @prop({ ref: () => Cafeteria })
    // cafe: Ref<Cafeteria>;

    @prop()
    orderId: String;

    @prop()
    title: string;

    @prop({ enum: TransactionType })
    transactionType: TransactionType;

    @prop({ enum: TransactionFor })
    transactionFor: TransactionFor;


    @prop({ enum: TransactionStatus })
    transactionStatus: TransactionStatus;

    @prop({ enum: BalanceAddStatus })
    balanceAddStatus: BalanceAddStatus;

    @prop()
    date: Date;

    // @prop({ ref: () => Offer })
    // offerApplied: Ref<Offer>;

    @prop()
    coinsEarned: number;

    @prop()
    totalAmount: number;

    @prop()
    walletBalance: number;

    @prop()
    walletAmount: number;


    @prop()
    paidSuccesOn: Date;

    @prop()
    rzpPaymentId: string;

    @prop()
    rzpOrderId: string;

    @prop()
    rechargeAmount: number;

    @prop()
    cashAmount: number;

    @prop()
    purchasedItems: string[];

    @prop()
    isActive: boolean;

    @prop()
    isDeleted: boolean;



}

export const TransactionModel = getModelForClass(Transaction, {
    schemaOptions: { timestamps: true },
});
