import mongoose from 'mongoose';
import { app } from './app';
import { DatabaseConnectionError } from '@invmtickets/common';

const start = async () => {
	if (!process.env.JWT_KEY || !process.env.MONGO_URI) {
		throw new Error('Environment variables are missing');
	}
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('Connected to db');
	} catch (error) {
		console.log(error);
		throw new DatabaseConnectionError();
	}
	app.listen(3000, () => {
		console.log('Listening on port 3000!');
	});
};

start();
