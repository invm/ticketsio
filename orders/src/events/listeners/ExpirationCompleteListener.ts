import { Message } from 'node-nats-streaming';
import {
	Subjects,
	Listener,
	ExpirationCompleteEvent,
	OrderStatus,
} from '@invmtickets/common';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/OrderCancelledPublisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
	queueGroupName = QUEUE_GROUP_NAME;

	async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
		const order = await Order.findById(data.orderId).populate('ticket');

		if (!order) throw new Error('Order not found');

		order.set({
			status: OrderStatus.Cancelled,
		});

		await order.save();

		new OrderCancelledPublisher(this.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id,
			},
		});

		msg.ack();
	}
}
