import { BrokerAsPromised as Broker, BrokerConfig } from 'rascal';
import config from './config/rascal.json';

(async () => {
	try {
		const broker = await Broker.create(config as BrokerConfig);
		broker.on('error', console.error);

		// Consume a message
		const subscription = await broker.subscribe('demo_subscription');
		subscription
			.on('message', (message, content, ackOrNack) => {
				console.log(message.properties.messageId, content);
				ackOrNack();
				// setTimeout(() => {
				// 	ackOrNack(new Error('second one'), { strategy: 'republish' });
				// }, 1000);
			})
			.on('error', console.error);
		process.on('SIGINT', () => broker.shutdown());
		process.on('SIGTERM', () => broker.shutdown());
	} catch (err) {
		console.error(err);
	}
})();
