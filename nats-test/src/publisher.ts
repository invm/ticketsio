import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';

console.clear();

const client = nats.connect('ticketsio', 'abc', {
	url: 'http://localhost:4222'
});

client.on('connect', () => {
	console.log('publisher connected to nats');

	const data = JSON.stringify({
		id: randomBytes(4).toString('hex'),
		title: randomBytes(4).toString('hex'),
		price: Math.floor(Math.random() * 100)
	});

	client.publish('ticket:created', data, () => {
		console.log('event published');
	});
});

process.on('SIGINT', () => client.close());
process.on('SIGTERM', () => client.close());
