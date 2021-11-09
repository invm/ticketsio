import { BrokerAsPromised as Broker, BrokerConfig } from 'rascal';
import config from './config/rascal.json';

(async () => {
	try {
		const broker = await Broker.create(config as BrokerConfig);
		broker.on('error', console.error);

		// TODO:
		// Get all events that very emitted in the past
		// set durable name for the listener to keep track of all events that were sent to this listener queue group
		// set a queue name so that events with be sent only to one instance of the listener

		// Consume a message
		const subscription = await broker.subscribe('demo_subscription', {
			queue: 'test_queue'
		});
		subscription
			.on('message', (message, content, ackOrNack) => {
				console.log(message.properties.messageId, content);
				ackOrNack();
				// setTimeout(() => {
				// 	ackOrNack(new Error('second one'), { strategy: 'republish' });
				// }, 5000);
			})
			.on('error', console.error);
		process.on('SIGINT', () => broker.shutdown());
		process.on('SIGTERM', () => broker.shutdown());
	} catch (err) {
		console.error(err);
	}
})();
