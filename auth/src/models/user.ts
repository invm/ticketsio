import mongoose from 'mongoose';
import { PasswordManager } from '../utils/password-manager';

// required to create a new user
interface IUser {
	email: string;
	password: string;
}

// user model properties
interface IUserModel extends mongoose.Model<IUserDocument> {
	build(user: IUser): IUserDocument;
}

// user document properties
interface IUserDocument extends mongoose.Document {
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		}
	},
	{
		timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
		toJSON: {
			transform(_, ret) {
				delete ret.password;
				delete ret.__v;
				ret.id = ret._id;
				delete ret._id;
			}
		}
	}
);

userSchema.pre('save', async function (done) {
	if (this.isModified('password')) {
		const hashed = await PasswordManager.toHash(this.get('password'));
		this.set('password', hashed);
	}
	done();
});

userSchema.statics.build = (user: IUser) => {
	return new User(user);
};

const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export { User };
