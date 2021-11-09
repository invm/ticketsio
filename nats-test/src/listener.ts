import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

const client = nats.connect('ticketsio', randomBytes(4).toString('hex'), {
	url: 'http://localhost:4222'
});

client.on('connect', () => {
	console.log('Nats connection established');
	client.on('close', () => {
		console.log('Nats connection closed');
		process.exit();
	});

	new TicketCreatedListener(client).listen();
});

process.on('SIGINT', () => client.close());
process.on('SIGTERM', () => client.close());
