import { Ref, getModelForClass, prop, } from '@typegoose/typegoose';
import { Cafeteria } from './../cafeModule/cafe.model';


export class Order {

    @prop()
    Restaurant: Object;

    @prop()
    Customer: Object;

    @prop()
    Order: Object;

    @prop()
    Tax: Object;

    @prop()
    Discount: Object;

    @prop()
    OrderItem: Object;
}

export const OrderModel = getModelForClass(Order, {
    schemaOptions: { timestamps: true },
});
