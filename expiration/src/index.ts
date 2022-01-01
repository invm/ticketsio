import { OrderCreatedListener } from './events/listeners/OrderCreatedListener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
	if (
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

    new OrderCreatedListener(natsWrapper.client).listen()

		natsWrapper.client.on('close', () => {
			console.log('Nats connection closed');
			process.exit();
		});

		process.on('SIGINT', () => natsWrapper.client.close());
		process.on('SIGTERM', () => natsWrapper.client.close());
	} catch (error) {
		console.log(error);
	}
};

start();
