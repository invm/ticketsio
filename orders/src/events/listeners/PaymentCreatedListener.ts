import { Message } from 'node-nats-streaming';
import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from '@invmtickets/common';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
	queueGroupName = QUEUE_GROUP_NAME;

	async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
		const { orderId } = data;

    const order = await Order.findById(orderId)

    if (!order) throw new Error('Order does not exist')

    order.set({ status: OrderStatus.Complete }) // TODO: emit event becuase the version is updated, also, this is the last state change so not that important

    await order.save()

		msg.ack();
	}
}
