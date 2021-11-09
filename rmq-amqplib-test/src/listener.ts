var q = 'tasks';
import amqp from 'amqplib';

const connectionUrl = 'amqp://localhost:5672';
const exchange = 'tickets:created';
const queue = 'ticket-created-order-queue';
let connection: amqp.Connection;
let channel: amqp.Channel;

const setConnection = async () => {
	try {
		connection = await amqp.connect(connectionUrl);
		channel = await connection.createChannel();

		await channel.assertExchange(exchange, 'fanout', { durable: true });

		await channel.assertQueue(queue);

		channel.consume(queue, (msg) => {
			console.log(msg?.fields.deliveryTag, msg?.content.toString() && JSON.parse(msg?.content.toString()));
			msg && channel.ack(msg);
		});
	} catch (error) {
		console.error(error);
	}
};

process.on('SIGINT', () => connection.close());
process.on('SIGTERM', () => connection.close());

setConnection();
