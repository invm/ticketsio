import mongoose from 'mongoose';

// required to create a new ticket
interface ITicket {
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
}

const ticketSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true
		},
		price: {
			type: Number,
			required: true
		}
	},
	{
		timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
		toJSON: {
			transform(_, ret) {
				delete ret.__v;
				ret.id = ret._id;
				delete ret._id;
			}
		}
	}
);

ticketSchema.statics.build = (ticket: ITicket) => {
	return new Ticket(ticket);
};

const Ticket = mongoose.model<ITicketDocument, ITicketModel>('Ticket', ticketSchema);

export { Ticket };
