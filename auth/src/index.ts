import express from 'express';
import 'express-async-errors';
import { errorHandler } from './middleware/error-handler';
import router from './routes';
import mongoose from 'mongoose';
import { DatabaseConnectionError, NotFoundError } from './errors';

const app = express();

app.use(express.json());

app.use('/api/users', router);

app.all('*', async () => {
	throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
	try {
		await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
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
