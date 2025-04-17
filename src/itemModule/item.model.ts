import { Ref, getModelForClass, prop } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';

export class Item {
  readonly _id: ObjectId;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  @prop()
  itemName: string;

  @prop()
  petPoojaItemId: string;

  @prop()
  image: string;

  @prop({ default: true })
  isActive: boolean;

  @prop({ default: false })
  isDeleted: boolean;
}

export const ItemModel = getModelForClass(Item, {
  schemaOptions: { timestamps: true }
});
