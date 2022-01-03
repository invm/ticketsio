import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCreatedEvent } from '@invmtickets/common';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = QUEUE_GROUP_NAME;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const { ticket, ...rest } = data;

		const order = Order.build({
			price: ticket.price,
			...rest,
		});

		await order.save();

		msg.ack();
	}
}
