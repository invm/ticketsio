import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let mongo: any;

declare global {
	var signIn: (id: string) => string[];
}

jest.mock('../nats-wrapper');

beforeAll(async () => {
	process.env.JWT_KEY = 'whatever';
	mongo = await MongoMemoryServer.create();
	const mongoUri = await mongo.getUri();

	await mongoose.connect(mongoUri);
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();

	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

global.signIn = (id: string) => {
	// build a jwt payload  { id,mail }
	const payload = {
		id,
		email: 'test@test.com'
	};

	// create the jwt
	const key = jwt.sign(payload, process.env.JWT_KEY!);

	// build session obj {jwt: jwt}
	const session = {
		jwt: key
	};

	// turn that session into json
	const sessionJSON = JSON.stringify(session);

	// take the json and encode to base64
	const base64 = Buffer.from(sessionJSON).toString('base64');

	// return a cookie string with the data
	return [`express:sess=${base64}`];
};
