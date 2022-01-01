import express from 'express';
import 'express-async-errors';
import { NotFoundError, errorHandler, currentUser } from '@invmtickets/common';
import cookieSession from 'cookie-session';
import router from './routes';

const app = express();

app.set('trust proxy', true);

app.use(express.json());

app.use(cookieSession({ signed: false }));

app.use(currentUser);

app.use('/api/tickets', router);

app.all('*', async () => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
