import mongoose from 'mongoose';
import { Password } from '../utils/password';

// required to create a new user
interface IUser {
	email: string;
	password: string;
}

// user model properties
interface IUserModal extends mongoose.Model<IUserDocument> {
	build(user: IUser): IUserDocument;
}

// user document properties
interface IUserDocument extends mongoose.Document {
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	}
});

userSchema.pre('save', async function (done) {
	if (this.isModified('password')) {
		const hashed = await Password.toHash(this.get('password'));
		this.set('password', hashed);
	}
	done();
});

userSchema.statics.build = (user: IUser) => {
	return new User(user);
};

const User = mongoose.model<IUserDocument, IUserModal>('User', userSchema);

export { User };
