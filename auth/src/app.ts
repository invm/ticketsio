import express from 'express';
import 'express-async-errors';
import { NotFoundError, errorHandler } from '@invmtickets/common';
import router from './routes';
import cookieSession from 'cookie-session';

const app = express();

app.set('trust proxy', true);

app.use(express.json());

app.use(
	cookieSession({
		// secure: process.env.NODE_ENV !== 'test',
		signed: false
	})
);

app.use('/api/users', router);

app.all('*', async () => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
