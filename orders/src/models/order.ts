import mongoose from 'mongoose';
import { OrderStatus } from '@invmtickets/common';
import { ITicketDocument } from './ticket';

// required to create a new order
interface IOrder {
	userId: string;
	status: OrderStatus;
	expiresAt: Date;
	ticket: ITicketDocument;
}

// order model properties
interface IOrderModel extends mongoose.Model<IOrderDocument> {
	build(order: IOrder): IOrderDocument;
}

// order document properties
interface IOrderDocument extends mongoose.Document {
	userId: string;
	status: OrderStatus;
	expiresAt: Date;
	ticket: ITicketDocument;
	createdAt: Date;
	updatedAt: Date;
}

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		ticket: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Ticket',
		},
		status: {
			type: String,
			enum: Object.values(OrderStatus),
			default: OrderStatus.Created,
			required: true,
		},
		expiresAt: {
			type: mongoose.Schema.Types.Date,
		},
	},
	{
		timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
		toJSON: {
			transform(_, ret) {
				delete ret.__v;
				ret.id = ret._id;
				delete ret._id;
			},
		},
	}
);

orderSchema.statics.build = (order: IOrder) => {
	return new Order(order);
};

const Order = mongoose.model<IOrderDocument, IOrderModel>('Order', orderSchema);

export { Order, OrderStatus };
