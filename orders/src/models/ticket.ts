import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

// required to create a new ticket
interface ITicket {
	id: string;
	title: string;
	price: number;
}

// ticket model properties
interface ITicketModel extends mongoose.Model<ITicketDocument> {
	build(ticket: ITicket): ITicketDocument;
}

// ticket document properties
export interface ITicketDocument extends mongoose.Document {
	title: string;
	price: number;
	createdAt: Date;
	updatedAt: Date;
	isReserved(): Promise<boolean>;
}

const ticketSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
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

ticketSchema.statics.build = ({ id, ...rest }: ITicket) => {
	return new Ticket({
		_id: id,
		...rest,
	});
};

ticketSchema.methods.isReserved = async function () {
	const existingOrder = await Order.findOne({
		ticket: this,
		status: {
			$in: [
				OrderStatus.Created,
				OrderStatus.AwaitingPayment,
				OrderStatus.Complete,
			],
		},
	});

	return !!existingOrder;
};

const Ticket = mongoose.model<ITicketDocument, ITicketModel>(
	'Ticket',
	ticketSchema
);

export { Ticket };
