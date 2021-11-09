import { BrokerAsPromised as Broker, BrokerConfig } from 'rascal';
import config from './config/rascal.json';

(async () => {
	try {
		const broker = await Broker.create(config as BrokerConfig);
		broker.on('error', console.error);

		// Publish a message
		const publication = await broker.publish('demo_publication', 'Hello World!', { queue: 'test_queue' });
		publication.on('error', console.error);
	} catch (err) {
		console.error(err);
	}
})();
