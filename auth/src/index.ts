import express from 'express';
import 'express-async-errors';
import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from './errors/not-found-error';
import router from './routes';

const app = express();

app.use(express.json());

app.use('/api/users', router);

app.all('*', async () => {
	throw new NotFoundError();
});

app.use(errorHandler);

app.listen(3000, () => {
	console.log('Listening on port 3000!');
});
