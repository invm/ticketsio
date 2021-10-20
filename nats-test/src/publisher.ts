import nats from 'node-nats-streaming';

console.clear();

const client = nats.connect('ticketsio', 'abc', {
	url: 'http://localhost:4222'
});

client.on('connect', () => {
	console.log('publisher connected to nats');

	const data = JSON.stringify({
		id: '123',
		title: 'conert',
		price: 20
	});

	client.publish('ticket:created', data, () => {
		console.log('event published');
	});
});
