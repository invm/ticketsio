import express from 'express';
import 'express-async-errors';
import { NotFoundError, errorHandler, currentUser } from '@invmtickets/common';
import cookieSession from 'cookie-session';

const app = express();

app.set('trust proxy', true);

app.use(express.json());

app.use(cookieSession({ signed: false }));

app.use(currentUser);

app.all('*', async () => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
