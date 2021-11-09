var q = 'tasks';
import amqp from 'amqplib';
import { randomBytes } from 'crypto';

const connectionUrl = 'amqp://localhost:5672';
const queue = 'ticket-created-order-queue';
let connection: amqp.Connection;
let channel: amqp.Channel;

console.clear();

const setConnection = async () => {
	try {
		connection = await amqp.connect(connectionUrl);
		channel = await connection.createConfirmChannel();

		await channel.assertQueue(queue);

		channel.sendToQueue(queue, Buffer.from(JSON.stringify({ id: randomBytes(4).toString('hex'), hello: 'world' })));
	} catch (error) {
		console.error(error);
	}
};

process.on('SIGINT', () => connection.close());
process.on('SIGTERM', () => connection.close());

setConnection();
