import mongoose from 'mongoose';
import { app } from './app';
import { DatabaseConnectionError } from '@invmtickets/common';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/OrderCreatedListener';
import { OrderCancelledListener } from './events/listeners/OrderCancelledListener';

const start = async () => {
	if (
		!process.env.STRIPE_KEY ||
		!process.env.JWT_KEY ||
		!process.env.MONGO_URI ||
		!process.env.NATS_URL ||
		!process.env.NATS_CLUSTER_ID ||
		!process.env.NATS_CLIENT_ID
	) {
		throw new Error('Environment variables are missing');
	}
	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL
		);

		natsWrapper.client.on('close', () => {
			console.log('Nats connection closed');
			process.exit();
		});

    new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()

		process.on('SIGINT', () => natsWrapper.client.close());
		process.on('SIGTERM', () => natsWrapper.client.close());
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
