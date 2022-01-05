import mongoose from 'mongoose';
import { OrderStatus } from '@invmtickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// required to create a new order
interface IOrder {
	id: string;
	userId: string;
	status: OrderStatus;
	price: number;
	version: number;
}

// order model properties
interface IOrderModel extends mongoose.Model<IOrderDocument> {
	build(order: IOrder): IOrderDocument;
}

// order document properties
interface IOrderDocument extends mongoose.Document {
	userId: string;
	status: OrderStatus;
	version: number;
	price: number;
}

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(OrderStatus),
			default: OrderStatus.Created,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
	},
	{
		toJSON: {
			transform(_, ret) {
				delete ret.__v;
				ret.id = ret._id;
				delete ret._id;
			},
		},
	}
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = ({ id, ...rest }: IOrder) => {
	return new Order({
		_id: id,
		...rest,
	});
};

const Order = mongoose.model<IOrderDocument, IOrderModel>('Order', orderSchema);

export { Order };
