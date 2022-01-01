import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// required to create a new ticket
interface ITicket {
	title: string;
	price: number;
	userId: string;
	orderId?: string;
}

// ticket model properties
interface ITicketModel extends mongoose.Model<ITicketDocument> {
	build(ticket: ITicket): ITicketDocument;
}

// ticket document properties
interface ITicketDocument extends mongoose.Document {
	userId: string;
	orderId?: string;
	title: string;
	price: number;
	createdAt: Date;
	updatedAt: Date;
	version: number;
}

const ticketSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		orderId: String,
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

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (ticket: ITicket) => {
	return new Ticket(ticket);
};

const Ticket = mongoose.model<ITicketDocument, ITicketModel>(
	'Ticket',
	ticketSchema
);

export { Ticket };
