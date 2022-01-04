import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// required to create a new payment
interface IPayment {
	orderId: string;
	chargeId: string;
	provider: string;
}

// payment model properties
interface IPaymentModel extends mongoose.Model<IPaymentDocument> {
	build(payment: IPayment): IPaymentDocument;
}

// payment document properties
interface IPaymentDocument extends mongoose.Document {
	orderId: string;
	chargeId: string;
	provider: string;
	version: number;
}

const paymentSchema = new mongoose.Schema(
	{
		orderId: {
			type: String,
			required: true,
		},
		chargeId: {
			type: String,
			required: true,
		},
		provider: {
			type: String,
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

paymentSchema.set('versionKey', 'version');
paymentSchema.plugin(updateIfCurrentPlugin);

paymentSchema.statics.build = (payment: IPayment) => {
	return new Payment(payment);
};

const Payment = mongoose.model<IPaymentDocument, IPaymentModel>(
	'Payment',
	paymentSchema
);

export { Payment };
