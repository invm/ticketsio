import nats, { Message } from 'node-nats-streaming';

console.clear();

const client = nats.connect('ticketsio', '123', {
	url: 'http://localhost:4222'
});

client.on('connect', () => {
	console.log('listener connected to nats');

	const options = client.subscriptionOptions().setManualAckMode(true);
	const subscription = client.subscribe('ticket:created', 'order-service-queue', options);

	subscription.on('message', (msg: Message) => {
		console.log(JSON.parse(msg.getData() as string));
		
		msg.ack();
	});
});
